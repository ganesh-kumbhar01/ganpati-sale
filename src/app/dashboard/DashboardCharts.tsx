"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function DashboardCharts({ trendData, stockSummary }: { trendData: any[], stockSummary?: any }) {
  
  const renderProgressBar = (label: string, data: { stock: number, booked: number, pickedUp: number }, colorClass: string, bgClass: string) => {
    const totalSold = data.booked + data.pickedUp;
    const percent = data.stock > 0 ? Math.round((totalSold / data.stock) * 100) : 0;
    const available = data.stock - totalSold;
    
    return (
      <div className="mb-6 last:mb-0">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {totalSold} <span className="text-slate-400 font-normal text-xs ml-1">Sold (out of {data.stock})</span>
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${bgClass} overflow-hidden`}>
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-500`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs font-semibold text-slate-500">{percent}%</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{available} Available in Godown</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Area Chart - Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Booking & Revenue Trend</h3>
        <p className="text-xs text-slate-500 mb-6">Daily sales volume</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5340FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5340FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D48D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D48D" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              
              <YAxis yAxisId="left" orientation="left" tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 10, fill: '#5340FF' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `Qty ${val}`} allowDecimals={false} tick={{ fontSize: 10, fill: '#00D48D' }} axisLine={false} tickLine={false} />
              
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#5340FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings (Qty)" stroke="#00D48D" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Summary - Progress Bars */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Stock Overview</h3>
          <p className="text-xs text-slate-500 mb-6">Category wise availability</p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          {stockSummary && (
            <>
              {renderProgressBar('Overall Ganpati Stock', stockSummary.total, 'bg-[#5340FF]', 'bg-indigo-50 dark:bg-indigo-900/20')}
              {renderProgressBar('Eco-friendly (Shadu Mati)', stockSummary.eco, 'bg-[#00D48D]', 'bg-emerald-50 dark:bg-emerald-900/20')}
              {renderProgressBar('POP (Plaster of Paris)', stockSummary.pop, 'bg-[#FFA900]', 'bg-amber-50 dark:bg-amber-900/20')}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
