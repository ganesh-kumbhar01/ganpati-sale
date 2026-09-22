"use client";

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 dark:hover:ring-offset-slate-900 transition-all focus:outline-none"
      >
        <User className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 border border-slate-200 dark:border-slate-700 py-1 z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
            <p className="text-sm text-slate-900 dark:text-white font-medium">My Profile</p>
          </div>
          
          <Link 
            href="/dashboard/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            Settings
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left"
          >
            <LogOut className="mr-3 h-4 w-4 text-rose-500 dark:text-rose-400" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
