import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentSeason } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const seasonId = await getCurrentSeason();
    if (!seasonId) return NextResponse.json({ error: 'No active season' }, { status: 400 });

    const data = await request.json();
    const demand = await prisma.demand.create({
      data: {
        seasonId,
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
