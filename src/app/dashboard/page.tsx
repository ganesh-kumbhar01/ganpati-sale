import React from 'react';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { IndianRupee, Package, ShoppingCart, Users, CheckCircle, ArrowRight, Wallet } from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { businesses: true },
  });

  if (!user || user.businesses.length === 0) {
    return <div>No business found. Please complete setup.</div>;
  }

  const business = user.businesses[0];

  const seasons = await prisma.season.findMany({
    where: { businessId: business.id },
    include: {
      products: true,
      bookings: {
        include: { customer: true, product: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { year: 'desc' }
  });

  // Calculate KPIs across all seasons for now
  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalStockCost = 0;
  
  const expenses = await prisma.expense.findMany({
    where: { season: { businessId: business.id } },
  });

  expenses.forEach(exp => {
    // Exclude 'Ganpati Purchase' from totalExpenses because it's already counted in totalStockCost
    if (exp.category !== 'Ganpati Purchase') {
      totalExpenses += exp.amount;
    }
  });

  let pickedUpStock = 0;
  let pendingPayments = 0;
  const totalCustomers = await prisma.customer.count({ where: { businessId: business.id } });

  const allBookings: any[] = [];
  const inventoryData: any[] = [];
  const trendMap: Record<string, { revenue: number; bookings: number }> = {};

  seasons.forEach(season => {
    season.products.forEach(p => {
      totalStockCost += (p.qtyPurchased * p.purchasePrice);
      pickedUpStock += p.qtyPickedUp;
      
      inventoryData.push({
        name: `${p.name} ${p.material === 'Eco-friendly' ? '(Eco)' : '(POP)'}`,
        total: p.qtyPurchased,
        booked: p.qtyBooked,
        pickedUp: p.qtyPickedUp
      });
    });

    season.bookings.forEach(b => {
      totalRevenue += b.totalPrice;
      pendingPayments += b.balanceAmount;
      allBookings.push(b);
      
      const dateStr = new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { revenue: 0, bookings: 0 };
      }
      trendMap[dateStr].revenue += b.totalPrice;
      trendMap[dateStr].bookings += b.quantity;
    });
  });

  const totalCost = totalStockCost + totalExpenses;

  inventoryData.sort((a, b) => b.total - a.total);
  const topInventoryData = inventoryData.slice(0, 8);

  const trendData = Object.keys(trendMap)
    .map(date => ({
      date,
      revenue: trendMap[date].revenue,
      bookings: trendMap[date].bookings,
      // Create a sortable date string (e.g. "09 Sep" -> "Sep 09" or parsed to timestamp)
      timestamp: new Date(`${date} ${new Date().getFullYear()}`).getTime()
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Calculate overall stock summary
  const stockSummary = {
    total: { stock: 0, booked: 0, pickedUp: 0 },
    pop: { stock: 0, booked: 0, pickedUp: 0 },
    eco: { stock: 0, booked: 0, pickedUp: 0 }
  };

  seasons.forEach(season => {
    season.products.forEach(p => {
      stockSummary.total.stock += p.qtyPurchased;
      stockSummary.total.booked += p.qtyBooked;
      stockSummary.total.pickedUp += p.qtyPickedUp;
      
      if (p.material === 'POP') {
        stockSummary.pop.stock += p.qtyPurchased;
        stockSummary.pop.booked += p.qtyBooked;
        stockSummary.pop.pickedUp += p.qtyPickedUp;
      } else {
        stockSummary.eco.stock += p.qtyPurchased;
        stockSummary.eco.booked += p.qtyBooked;
        stockSummary.eco.pickedUp += p.qtyPickedUp;
      }
    });
  });

  // Sort bookings across seasons by newest first
  allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const recentBookings = allBookings.slice(0, 5);
  const pendingPickups = allBookings.filter(b => b.status === 'BOOKED').slice(0, 5);
  
  const profitPercentage = totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0;

  const getGreeting = () => {
    const hour = parseInt(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: 'numeric', hour12: false }), 10);
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-2xl sm:tracking-tight">
            {getGreeting()}, {business.ownerName}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Here is what's happening with your business system today.
          </p>
        </div>
        <div className="flex w-full md:w-auto items-center justify-center gap-3 mt-2 sm:mt-0">
          <Link href="/dashboard/products" className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
            Add Stock
          </Link>
          <Link href="/dashboard/bookings" className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg bg-[#5340FF] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            New Booking
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Total Revenue</p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex flex-shrink-0 items-center justify-center">
              <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Rs. {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Stock Cost</p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 flex flex-shrink-0 items-center justify-center">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Rs. {totalStockCost.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Total Investment</p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex flex-shrink-0 items-center justify-center">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Rs. {totalCost.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Bookings</p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex flex-shrink-0 items-center justify-center">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-[#5340FF] dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{allBookings.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="truncate text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Booked Murtis</p>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 dark:bg-sky-900/20 flex flex-shrink-0 items-center justify-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stockSummary.total.booked + stockSummary.total.pickedUp} <span className="text-sm font-semibold text-slate-400">/ {stockSummary.total.stock}</span>
          </p>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts trendData={trendData} stockSummary={stockSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Bookings</h3>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-[#5340FF] hover:text-indigo-500">
              View all &rarr;
            </Link>
          </div>
          
          <div className="hidden sm:grid grid-cols-4 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
            <div className="col-span-2">Customer & Product</div>
            <div>Status</div>
            <div className="text-right">Date</div>
          </div>

          <ul className="space-y-2">
            {recentBookings.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">No bookings yet.</li>
            ) : (
              recentBookings.map((b) => (
                <li key={b.id} className="p-3 sm:p-2 bg-slate-50 sm:bg-transparent dark:bg-slate-700/30 sm:dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl sm:rounded-lg transition-colors border border-slate-100 sm:border-transparent dark:border-slate-700/50">
                  <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 sm:items-center">
                    <div className="col-span-2 flex justify-between sm:block">
                      <div className="truncate">
                        <p className="text-sm sm:text-xs font-bold text-slate-900 dark:text-white truncate">{b.customer.name}</p>
                        <p className="text-xs sm:text-[11px] text-slate-500 truncate">{b.product.name} (Qty: {b.quantity})</p>
                      </div>
                      {/* Mobile Only Status & Date */}
                      <div className="flex flex-col items-end sm:hidden">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                          b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                          b.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 
                          'bg-indigo-50 text-indigo-700 ring-indigo-600/20'
                        }`}>
                          {b.status === 'BOOKED' ? 'Confirmed' : b.status}
                        </span>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">
                          {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${
                        b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                        b.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 
                        'bg-indigo-50 text-indigo-700 ring-indigo-600/20'
                      }`}>
                        {b.status === 'BOOKED' ? 'Confirmed' : b.status}
                      </span>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-[11px] font-medium text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Upcoming Pickups -> Agent Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Delivery</h3>
          </div>

          <div className="hidden sm:grid grid-cols-4 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
            <div className="col-span-2">Customer</div>
            <div className="text-center">Action</div>
            <div className="text-right">Pending</div>
          </div>

          <ul className="space-y-2">
            {pendingPickups.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">No pending pickups.</li>
            ) : (
              pendingPickups.map((b) => (
                <li key={b.id} className="p-3 sm:p-2 bg-slate-50 sm:bg-transparent dark:bg-slate-700/30 sm:dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl sm:rounded-lg transition-colors border border-slate-100 sm:border-transparent dark:border-slate-700/50">
                  <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 sm:items-center">
                    <div className="col-span-2 flex justify-between sm:block">
                      <div className="truncate">
                        <p className="text-sm sm:text-xs font-bold text-slate-900 dark:text-white truncate">{b.customer.name}</p>
                        <p className="text-xs sm:text-[11px] text-slate-500 truncate">{b.customer.mobile}</p>
                      </div>
                      {/* Mobile Only Action & Pending */}
                      <div className="flex flex-col items-center justify-center sm:hidden w-28">
                        <span className="text-[11px] font-extrabold text-[#FF4C4C] mb-1">
                          Rs. {b.balanceAmount}
                        </span>
                        <Link href="/dashboard/pickup" className="w-full text-center inline-flex items-center justify-center rounded-md bg-indigo-50 px-2 py-1.5 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                          Pending Delivery
                        </Link>
                      </div>
                    </div>
                    <div className="hidden sm:block text-center">
                      <Link href="/dashboard/pickup" className="text-[11px] font-bold text-[#5340FF] hover:underline">
                        Pending Delivery
                      </Link>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="text-[11px] font-bold text-[#FF4C4C]">
                        Rs. {b.balanceAmount}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

