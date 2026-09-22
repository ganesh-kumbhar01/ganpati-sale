import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const productSchema = z.object({
  name: z.string().min(1).optional(),
  size: z.string().optional(),
  material: z.enum(["POP", "Eco-friendly"]).optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  qtyPurchased: z.number().int().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = productSchema.parse(body);

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate new qtyAvailable based on qtyPurchased difference if qtyPurchased is being updated
    let newQtyAvailable = existingProduct.qtyAvailable;
    if (data.qtyPurchased !== undefined) {
      const diff = data.qtyPurchased - existingProduct.qtyPurchased;
      newQtyAvailable = existingProduct.qtyAvailable + diff;
      if (newQtyAvailable < 0) {
        return NextResponse.json({ error: 'Available quantity cannot be negative.' }, { status: 400 });
      }
    }

    const updateData: any = { ...data };
    if (data.qtyPurchased !== undefined) {
      updateData.qtyAvailable = newQtyAvailable;
    }
    
    // allow clearing the image url
    if (data.imageUrl === null) {
        updateData.imageUrl = null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { season: true },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
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

    // Check if product is used in any bookings
    const bookingsCount = await prisma.booking.count({
      where: { productId: params.id },
    });

    if (bookingsCount > 0) {
      return NextResponse.json({ error: 'Cannot delete product with existing bookings.' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
