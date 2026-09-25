"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function PaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = initialPayments.filter(p => 
    p.booking?.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.booking?.customer?.mobile.includes(searchTerm)
  );

  return (
    <div>
      <div className="mb-6 max-w-md relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Search by customer name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
        />
      </div>

            <div className="flex justify-end sm:hidden mb-2">
        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          Scroll table to view more
        </span>
      </div>
      <div className="overflow-x-auto shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Customer Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Payment Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(payment.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{payment.booking?.customer?.name}</div>
                      <div className="text-xs text-slate-500">{payment.booking?.customer?.mobile}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {payment.booking?.product?.name} <span className="text-xs">(Qty: {payment.booking?.quantity})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.paymentType === 'ADVANCE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    {payment.paymentType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {payment.amount}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                  No payments found. Payments are recorded automatically when you make a booking or process a pickup.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

