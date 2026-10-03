import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import WaitlistClient from './WaitlistClient';

export default async function WaitlistPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const business = await prisma.business.findFirst({ where: { userId: session.userId } });
  if (!business) redirect('/dashboard');
  
  const activeSeason = await prisma.season.findFirst({
    where: { businessId: business.id, status: 'ACTIVE' }
  });
  
  if (!activeSeason) return <div>No active season</div>;

  const demands = await prisma.demand.findMany({
    where: { seasonId: activeSeason.id },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return <WaitlistClient demands={demands} />;
}
