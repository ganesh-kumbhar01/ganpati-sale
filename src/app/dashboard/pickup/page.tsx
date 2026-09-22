import React from 'react';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PickupClient from './PickupClient';

export default async function PickupPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { businesses: true },
  });

  if (!user || user.businesses.length === 0) redirect('/dashboard');

  const bookings = await prisma.booking.findMany({
    where: { 
      season: { businessId: user.businesses[0].id },
      status: 'BOOKED' // Only show pending pickups initially
    },
    include: { customer: true, product: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Pickup Day Workflow
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search bookings, collect pending balance, and hand over the Ganpati.
          </p>
        </div>
      </div>
      
      <PickupClient initialBookings={bookings} />
    </div>
  );
}
