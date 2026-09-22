import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const seasonSchema = z.object({
  name: z.string().min(1).optional(),
  year: z.number().int().min(2000).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = seasonSchema.parse(body);

    const updatedSeason = await prisma.season.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, season: updatedSeason });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if season has related data (products, bookings, expenses) before deleting
    const productCount = await prisma.product.count({ where: { seasonId: params.id } });
    const bookingCount = await prisma.booking.count({ where: { seasonId: params.id } });
    const expenseCount = await prisma.expense.count({ where: { seasonId: params.id } });

    if (productCount > 0 || bookingCount > 0 || expenseCount > 0) {
      return NextResponse.json({ error: 'Cannot delete season with existing records.' }, { status: 400 });
    }

    await prisma.season.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
