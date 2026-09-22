import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { z } from 'zod';
import { login } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  ownerName: z.string().min(1),
  businessName: z.string().min(1),
  mobile: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, ownerName, businessName, mobile } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user and business within a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password_hash,
        },
      });

      await tx.business.create({
        data: {
          userId: newUser.id,
          name: businessName,
          ownerName: ownerName,
          mobile: mobile,
        },
      });

      return newUser;
    });

    // Create session
    await login(user.id);

    return NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
