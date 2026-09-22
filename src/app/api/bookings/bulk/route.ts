import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, bookingIds } = body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json({ error: 'No bookings provided' }, { status: 400 });
    }

    // Verify all bookings belong to the user
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
        season: { business: { userId: session.userId } },
      },
    });

    if (bookings.length !== bookingIds.length) {
      return NextResponse.json({ error: 'Some bookings are invalid or unauthorized' }, { status: 403 });
    }

    if (action === 'DELETE') {
      await prisma.$transaction(async (tx) => {
        for (const booking of bookings) {
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
          await tx.booking.delete({ where: { id: booking.id } });
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
