import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const pickupSchema = z.object({
  bookingId: z.string().min(1),
  paymentAmount: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = pickupSchema.parse(body);

    const booking = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findUnique({
        where: { id: data.bookingId },
        include: { product: true },
      });

      if (!existingBooking) throw new Error('Booking not found');
      if (existingBooking.status === 'COMPLETED') throw new Error('Booking is already completed');

      // Record final payment if any
      if (data.paymentAmount > 0) {
        await tx.payment.create({
          data: {
            bookingId: existingBooking.id,
            amount: data.paymentAmount,
            paymentType: 'FINAL',
          },
        });
      }

      // Update Booking status and balance
      const newBalance = existingBooking.balanceAmount - data.paymentAmount;
      const updatedBooking = await tx.booking.update({
        where: { id: existingBooking.id },
        data: {
          balanceAmount: Math.max(0, newBalance),
          status: 'COMPLETED',
          pickupDate: new Date(),
        },
      });

      // Update Inventory (move from booked to picked up)
      await tx.product.update({
        where: { id: existingBooking.productId },
        data: {
          qtyBooked: Math.max(0, existingBooking.product.qtyBooked - existingBooking.quantity),
          qtyPickedUp: existingBooking.product.qtyPickedUp + existingBooking.quantity,
        },
      });

      return updatedBooking;
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
