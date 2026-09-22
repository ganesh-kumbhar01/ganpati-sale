import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PrintClient from './PrintClient';

export default async function PrintInvoicesPage({ searchParams }: { searchParams: { ids?: string } }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  if (!searchParams.ids) {
    return <div className="p-10 text-center">No bookings selected for printing.</div>;
  }

  const idsArray = searchParams.ids.split(',');

  const bookings = await prisma.booking.findMany({
    where: {
      id: { in: idsArray },
      season: { business: { userId: session.userId } }
    },
    include: {
      customer: true,
      product: true,
      season: { include: { business: true } }
    },
  });

  return (
    <div className="bg-white min-h-screen text-black">
      <PrintClient bookings={bookings} />
    </div>
  );
}
