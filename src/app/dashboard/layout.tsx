"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, Calendar, Settings, LogOut, IndianRupee, FileText, CheckSquare, Truck, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalSearch } from '@/components/GlobalSearch';
import { ProfileDropdown } from '@/components/ProfileDropdown';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/bookings', icon: FileText },
  { name: 'Pickup Day', href: '/dashboard/pickup', icon: CheckSquare },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Payments', href: '/dashboard/payments', icon: IndianRupee },
  { name: 'Seasons', href: '/dashboard/seasons', icon: Calendar },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex md:flex-col">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center mix-blend-multiply dark:mix-blend-screen">
            <img src="/new-logo.jpg" alt="Ekdant Logo" className="w-full h-full object-cover scale-[1.35]" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent tracking-tight">Ekdant</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Persistent Top Header */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between gap-x-2 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-x-2.5 md:hidden">
            <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center mix-blend-multiply dark:mix-blend-screen">
              <img src="/new-logo.jpg" alt="Ekdant Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
            <div className="text-lg font-extrabold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent tracking-tight hidden sm:block">Ekdant</div>
          </div>
          
          <div className="flex flex-1 items-center justify-end md:justify-between w-full">
            <div className="hidden md:block w-full max-w-xl">
              <GlobalSearch />
            </div>
            
            <div className="flex items-center gap-x-2 sm:gap-x-4 ml-auto">
              <div className="md:hidden w-48 sm:w-64">
                <GlobalSearch />
              </div>
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 pb-24 md:p-6 lg:p-8 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Premium Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
        <nav 
          className="flex overflow-x-auto snap-x snap-mandatory items-center py-2 px-2 gap-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide webkit scrollbar hack via inline style or globals, but since we can't reliably inject CSS here, we rely on scrollbarWidth */}
          <style dangerouslySetInnerHTML={{__html: `nav::-webkit-scrollbar { display: none; }`}} />
          
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`snap-start shrink-0 flex flex-col items-center justify-center min-w-[76px] px-1 py-1.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className={`h-5 w-5 mb-1 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`} />
                <span className="text-[10px] font-bold tracking-wide whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
