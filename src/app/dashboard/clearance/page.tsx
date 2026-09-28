import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClearanceClient from './ClearanceClient';
import { Product } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function ClearancePage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const business = await prisma.business.findFirst({
    where: { userId: session.userId }
  });

  if (!business) redirect('/login');

  const products = await prisma.product.findMany({
    where: { 
      season: { businessId: business.id },
      isClearance: true
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-xl">
              🔥
            </span>
            Clearance Watchlist
          </h1>
          <p className="mt-1 sm:mt-2 text-sm text-slate-500 dark:text-slate-400">
            Murtis marked as slow-moving or needing special attention.
          </p>
        </div>
      </div>

      <ClearanceClient products={products} />
    </div>
  );
}
