import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const purchaseSchema = z.object({
  seasonId: z.string().min(1),
  supplierId: z.string().min(1),
  totalAmount: z.number().min(0),
  transportCost: z.number().min(0),
  otherExpenses: z.number().min(0),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

    const purchases = await prisma.purchase.findMany({
      where: { season: { businessId: user.businesses[0].id } },
      include: { supplier: true, season: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = purchaseSchema.parse(body);

    const newPurchase = await prisma.purchase.create({
      data: {
        seasonId: data.seasonId,
        supplierId: data.supplierId,
        totalAmount: data.totalAmount,
        transportCost: data.transportCost,
        otherExpenses: data.otherExpenses,
      },
      include: { supplier: true, season: true },
    });

    return NextResponse.json({ success: true, purchase: newPurchase });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
