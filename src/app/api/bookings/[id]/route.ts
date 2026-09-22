import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { season: { include: { business: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.season.business.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      // Restore inventory
      if (booking.status === 'BOOKED') {
        await tx.product.update({
          where: { id: booking.productId },
          data: {
            qtyAvailable: { increment: booking.quantity },
            qtyBooked: { decrement: booking.quantity },
          },
        });
      } else if (booking.status === 'COMPLETED') {
        await tx.product.update({
          where: { id: booking.productId },
          data: {
            qtyAvailable: { increment: booking.quantity },
            qtyPickedUp: { decrement: booking.quantity },
          },
        });
      }

      // Payments are deleted automatically via Cascade
      await tx.booking.delete({
        where: { id: booking.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { season: { include: { business: true } } },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.season.business.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // For simplicity, we'll only allow updating basic fields (totalPrice, advanceAmount, balanceAmount, customerName, customerMobile)
    // Changing products or quantities is complex due to inventory, so we skip it for now in quick-edit.
    
    let customerId = booking.customerId;

    if (body.customerName || body.customerMobile) {
      const currentCustomer = await prisma.customer.findUnique({ where: { id: booking.customerId } });
      const newName = body.customerName || currentCustomer?.name;
      const newMobile = body.customerMobile || currentCustomer?.mobile;

      if (currentCustomer && (currentCustomer.name !== newName || currentCustomer.mobile !== newMobile)) {
        let newCustomer = await prisma.customer.findFirst({
          where: { businessId: booking.season.business.id, mobile: newMobile }
        });

        if (!newCustomer) {
           newCustomer = await prisma.customer.create({
             data: {
               businessId: booking.season.business.id,
               name: newName,
               mobile: newMobile,
               customerType: 'NEW'
             }
           });
        } else if (newCustomer.name !== newName) {
           await prisma.customer.update({
             where: { id: newCustomer.id },
             data: { name: newName }
           });
        }
        customerId = newCustomer.id;
      }
    }

    // Update Booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        customerId: customerId,
        totalPrice: body.totalPrice !== undefined ? body.totalPrice : undefined,
        advanceAmount: body.advanceAmount !== undefined ? body.advanceAmount : undefined,
        balanceAmount: body.balanceAmount !== undefined ? body.balanceAmount : undefined,
        pickupDate: body.pickupDate ? new Date(body.pickupDate) : undefined,
      }
    });

    // We don't automatically update payments here to keep it simple, but we could sync the first payment.

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
