import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const productSchema = z.object({
  seasonId: z.string().min(1),
  name: z.string().min(1),
  size: z.string().optional(),
  material: z.enum(["POP", "Eco-friendly"]).default("POP"),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  qtyPurchased: z.number().int().min(0),
  imageUrl: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const seasonId = url.searchParams.get('seasonId');
    const whereClause: any = {};
    if (seasonId) whereClause.seasonId = seasonId;

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { season: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = productSchema.parse(body);

    const newProduct = await prisma.product.create({
      data: {
        seasonId: data.seasonId,
        name: data.name,
        size: data.size,
        material: data.material,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        qtyPurchased: data.qtyPurchased,
        qtyAvailable: data.qtyPurchased, // Initially, available is equal to purchased
        imageUrl: data.imageUrl,
      },
      include: { season: true },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
