import React from 'react';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft, TrendingUp, IndianRupee, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';
import PrintButton from './PrintButton';

export default async function SeasonReportPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const season = await prisma.season.findUnique({
    where: { id: params.id },
    include: {
      products: true,
      bookings: {
        where: { status: { not: 'CANCELLED' } }
      },
      expenses: true,
    }
  });

  if (!season) {
    return <div className="p-8 text-center text-slate-500">Season not found</div>;
  }

  // --- Calculations ---

  // 1. Revenue & Collections
  const totalRevenue = season.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalPending = season.bookings.reduce((sum, b) => sum + b.balanceAmount, 0);
  const totalCollected = totalRevenue - totalPending;

  // 2. Costs & Expenses
  const totalInventoryCost = season.products.reduce((sum, p) => sum + (p.purchasePrice * p.qtyPurchased), 0);
  const totalExpenses = season.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 3. Profit
  const netProfit = totalRevenue - totalInventoryCost - totalExpenses;

  // 4. Inventory
  const totalMurtisBought = season.products.reduce((sum, p) => sum + p.qtyPurchased, 0);
  const totalMurtisSold = season.bookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalMurtisLeft = season.products.reduce((sum, p) => sum + p.qtyAvailable, 0);

  // 5. Expense Breakdown
  const expensesByCategory = season.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const expenseChartData = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Action Bar - Hidden on Print */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href="/dashboard/seasons" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Seasons
        </Link>
        <PrintButton />
      </div>

      {/* Report Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black">
        
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-10 text-white print:bg-indigo-600 print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold mb-2">Season Financial Report</h1>
              <p className="text-indigo-100 text-lg">{season.name} ({season.year})</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-200 uppercase tracking-widest font-semibold mb-1">Status</p>
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {season.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          
          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-700 print:bg-slate-50 print:border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><IndianRupee className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white print:text-black">Revenue & Profit</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                  <span className="text-slate-600 dark:text-slate-400 print:text-slate-700">Total Sales (Revenue)</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">Rs. {totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                  <span className="text-slate-600 dark:text-slate-400 print:text-slate-700">Inventory Cost</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 print:text-rose-600">- Rs. {totalInventoryCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                  <span className="text-slate-600 dark:text-slate-400 print:text-slate-700">Operational Expenses</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 print:text-rose-600">- Rs. {totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white print:text-black">Net Profit</span>
                  <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400 print:text-emerald-600' : 'text-rose-600 dark:text-rose-400 print:text-rose-600'}`}>
                    Rs. {netProfit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-700 print:bg-slate-50 print:border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white print:text-black">Cash Flow Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                  <span className="text-slate-600 dark:text-slate-400 print:text-slate-700">Amount Collected</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 print:text-emerald-600">Rs. {totalCollected.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                  <span className="text-slate-600 dark:text-slate-400 print:text-slate-700">Pending to Collect</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 print:text-amber-600">Rs. {totalPending.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-900 dark:text-white print:text-black font-medium text-sm">Collection Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    {totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0}%
                  </span>
                </div>
                
                {/* Simple Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 print:bg-slate-300" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div 
                    className="bg-emerald-500 h-2 rounded-full print:bg-emerald-500" 
                    style={{ width: `${totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0}%`, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                  ></div>
                </div>

              </div>
            </div>

          </div>

          <hr className="border-slate-200 dark:border-slate-800 my-8 print:border-slate-300" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Inventory Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Package className="w-5 h-5" /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-black">Inventory Summary</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-700 print:bg-slate-50 print:border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 print:text-slate-600">Total Bought</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white print:text-black">{totalMurtisBought}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center border border-emerald-100 dark:border-emerald-800/30 print:bg-emerald-50 print:border-emerald-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Total Sold</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 print:text-emerald-800">{totalMurtisSold}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl text-center border border-rose-100 dark:border-rose-800/30 print:bg-rose-50 print:border-rose-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Unsold Stock</p>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 print:text-rose-800">{totalMurtisLeft}</p>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white print:text-black">Expense Breakdown</h3>
              </div>
              
              {expenseChartData.length > 0 ? (
                <div className="space-y-3">
                  {expenseChartData.map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 print:bg-slate-50 print:border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                      <span className="font-medium text-slate-700 dark:text-slate-300 print:text-slate-800">{category}</span>
                      <span className="font-bold text-slate-900 dark:text-white print:text-black">Rs. {amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 font-bold text-rose-600 dark:text-rose-400 print:text-rose-600">
                    <span>Total Expenses</span>
                    <span>Rs. {totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center print:bg-slate-50">No expenses recorded for this season.</p>
              )}
            </div>

          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/80 px-8 py-4 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800 print:bg-white print:border-none print:mt-10" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          Report generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')} via Vighnharta Dashboard.
        </div>
      </div>
    </div>
  );
}
