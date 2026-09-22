import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { business: true },
    });

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    if (customer.business.userId !== session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        isStarred: body.isStarred !== undefined ? body.isStarred : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      }
    });

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
