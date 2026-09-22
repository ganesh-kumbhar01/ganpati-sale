import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const bookingSchema = z.object({
  seasonId: z.string().min(1),
  productId: z.string().min(1),
  customerName: z.string().min(1),
  customerMobile: z.string().min(10),
  quantity: z.number().int().min(1),
  totalPrice: z.number().min(0),
  advanceAmount: z.number().min(0),
  pickupDate: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isDirectSale: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { season: { businessId: user.businesses[0].id } },
      include: { customer: true, product: true, season: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = bookingSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    const businessId = user.businesses[0].id;

    // Use a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Check Product availability
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product || product.qtyAvailable < data.quantity) {
        throw new Error('Not enough inventory available');
      }

      // 2. Find or create Customer
      let customer = await tx.customer.findFirst({
        where: { businessId, mobile: data.customerMobile },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            businessId,
            name: data.customerName,
            mobile: data.customerMobile,
            customerType: 'NEW',
          },
        });
      } else {
        // Optional: Update customerType to 'RETURNING' if they already have bookings
        const existingBookings = await tx.booking.count({ where: { customerId: customer.id } });
        if (existingBookings > 0 && customer.customerType === 'NEW') {
          await tx.customer.update({
            where: { id: customer.id },
            data: { customerType: 'RETURNING' },
          });
        }
      }

      // 3. Create Booking
      const balanceAmount = data.totalPrice - data.advanceAmount;
      const newBooking = await tx.booking.create({
        data: {
          seasonId: data.seasonId,
          customerId: customer.id,
          productId: data.productId,
          quantity: data.quantity,
          totalPrice: data.totalPrice,
          advanceAmount: data.advanceAmount,
          balanceAmount,
          pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
          imageUrl: data.imageUrl,
          status: data.isDirectSale ? 'COMPLETED' : 'BOOKED',
        },
      });

      // 4. Record Payment if advance > 0
      if (data.advanceAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            amount: data.advanceAmount,
            paymentType: 'ADVANCE',
          },
        });
      }

      // 5. Update Inventory
      await tx.product.update({
        where: { id: data.productId },
        data: {
          qtyAvailable: product.qtyAvailable - data.quantity,
          qtyBooked: data.isDirectSale ? product.qtyBooked : product.qtyBooked + data.quantity,
          qtyPickedUp: data.isDirectSale ? product.qtyPickedUp + data.quantity : product.qtyPickedUp,
        },
      });

      return newBooking;
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
