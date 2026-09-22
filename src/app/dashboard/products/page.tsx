import React from 'react';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { businesses: true },
  });

  if (!user || user.businesses.length === 0) redirect('/dashboard');

  const businessId = user.businesses[0].id;

  const seasons = await prisma.season.findMany({
    where: { businessId },
    orderBy: { year: 'desc' },
  });

  if (seasons.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No seasons found</h3>
        <p className="mt-1 text-sm text-slate-500">Get started by creating a new season first.</p>
      </div>
    );
  }

  // Fetch products for all seasons by default, or just active ones
  const products = await prisma.product.findMany({
    where: { season: { businessId } },
    include: { season: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Products & Inventory
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your Ganpati models and their stock.
          </p>
        </div>
      </div>
      
      <ProductsClient initialProducts={products} seasons={seasons} />
    </div>
  );
}
