import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const expenseSchema = z.object({
  seasonId: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().min(0),
  description: z.string().nullable().optional(),
  receiptUrl: z.string().nullable().optional(),
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

    const expenses = await prisma.expense.findMany({
      where: { season: { businessId: user.businesses[0].id } },
      include: { season: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = expenseSchema.parse(body);

    const newExpense = await prisma.expense.create({
      data: {
        seasonId: data.seasonId,
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        receiptUrl: data.receiptUrl || null,
      },
      include: { season: true },
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
