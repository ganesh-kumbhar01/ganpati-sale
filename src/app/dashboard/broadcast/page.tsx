import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import BroadcastClient from './BroadcastClient';

export default async function BroadcastPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const business = await prisma.business.findFirst({ where: { userId: session.userId } });
  if (!business) redirect('/dashboard');

  const customers = await prisma.customer.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' }
  });

  return <BroadcastClient customers={customers} />;
}
