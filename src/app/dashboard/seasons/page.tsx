import React from 'react';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SeasonsClient from './SeasonsClient';

export default async function SeasonsPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { businesses: true },
  });

  if (!user || user.businesses.length === 0) redirect('/dashboard');

  const seasons = await prisma.season.findMany({
    where: { businessId: user.businesses[0].id },
    orderBy: { year: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Seasons
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your festival seasons (e.g., Ganpati 2027)
          </p>
        </div>
      </div>
      
      <SeasonsClient initialSeasons={seasons} />
    </div>
  );
}
