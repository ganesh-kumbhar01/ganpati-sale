import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ customers: [], products: [], bookings: [] });
    }
    const businessId = user.businesses[0].id;

    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.toLowerCase() || '';

    if (!q) {
      return NextResponse.json({ customers: [], products: [], bookings: [] });
    }

    // Search Customers
    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: q } },
          { mobile: { contains: q } },
        ]
      },
      take: 5
    });

    // Search Products
    const products = await prisma.product.findMany({
      where: {
        season: { businessId },
        name: { contains: q }
      },
      take: 5
    });

    // Search Bookings (via Customer name)
    const bookings = await prisma.booking.findMany({
      where: {
        season: { businessId },
        customer: {
          OR: [
            { name: { contains: q } },
            { mobile: { contains: q } }
          ]
        }
      },
      include: { customer: true, product: true },
      take: 5
    });

    return NextResponse.json({ customers, products, bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
