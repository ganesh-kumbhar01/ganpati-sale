import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center bg-white dark:bg-slate-800 w-24 h-24 rounded-full mb-4 shadow-md overflow-hidden p-1 border-2 border-indigo-100 dark:border-indigo-900/50">
          <img src="/bappa-logo.jpg" alt="Vighnharta Logo" className="w-full h-full object-cover rounded-full mix-blend-multiply dark:mix-blend-normal" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Vighnharta
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Reseller Business Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20 dark:border-slate-700/50">
          {children}
        </div>
      </div>
      
      <Toaster position="top-center" />
    </div>
  );
}
