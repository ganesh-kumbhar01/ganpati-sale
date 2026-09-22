import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const updateBusinessSchema = z.object({
  name: z.string().min(1),
  ownerName: z.string().min(1),
  mobile: z.string().min(10),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = updateBusinessSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessId = user.businesses[0].id;

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data,
    });

    return NextResponse.json({ success: true, business: updatedBusiness });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
