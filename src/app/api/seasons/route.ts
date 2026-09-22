import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const seasonSchema = z.object({
  name: z.string().min(1),
  year: z.number().int().min(2000),
  bookingStart: z.string().optional(),
  bookingEnd: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const seasons = await prisma.season.findMany({
      where: { businessId: user.businesses[0].id },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({ seasons });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = seasonSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { businesses: true },
    });

    if (!user || user.businesses.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const newSeason = await prisma.season.create({
      data: {
        businessId: user.businesses[0].id,
        name: data.name,
        year: data.year,
        bookingStart: data.bookingStart ? new Date(data.bookingStart) : null,
        bookingEnd: data.bookingEnd ? new Date(data.bookingEnd) : null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, season: newSeason });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
