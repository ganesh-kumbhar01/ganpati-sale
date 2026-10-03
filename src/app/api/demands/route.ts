import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    // Get seasonId from the product
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const demand = await prisma.demand.create({
      data: {
        seasonId: product.seasonId,
        productId: data.productId,
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        notes: data.notes || null,
      }
    });
    return NextResponse.json(demand);
  } catch (error) {
    console.error('Demand error:', error);
    return NextResponse.json({ error: 'Failed to record demand' }, { status: 500 });
  }
}
