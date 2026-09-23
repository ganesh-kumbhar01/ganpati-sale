"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Package, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ customers: any[], products: any[], bookings: any[] }>({
    customers: [], products: [], bookings: []
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults({ customers: [], products: [], bookings: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Global Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) setIsOpen(true);
          }}
          className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800 py-2 pl-10 pr-3 text-base sm:text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50">
          {loading && <div className="p-4 text-sm text-slate-500 text-center">Searching...</div>}
          
          {!loading && results.customers.length === 0 && results.products.length === 0 && results.bookings.length === 0 && (
            <div className="p-4 text-sm text-slate-500 text-center">No results found for "{query}"</div>
          )}

          {!loading && results.customers.length > 0 && (
            <div className="p-2">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customers</h3>
              {results.customers.map(c => (
                <div key={c.id} onClick={() => { setIsOpen(false); router.push('/dashboard/customers'); }} className="flex items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer">
                  <Users className="w-4 h-4 mr-3 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.mobile}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.products.length > 0 && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Products</h3>
              {results.products.map(p => (
                <div key={p.id} onClick={() => { setIsOpen(false); router.push('/dashboard/products'); }} className="flex items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer">
                  <Package className="w-4 h-4 mr-3 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-xs text-slate-500">Stock: {p.qtyAvailable} / {p.qtyPurchased}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.bookings.length > 0 && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bookings</h3>
              {results.bookings.map(b => (
                <div key={b.id} onClick={() => { setIsOpen(false); router.push('/dashboard/bookings'); }} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-3 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{b.customer?.name}</div>
                      <div className="text-xs text-slate-500">{b.product?.name} (Qty: {b.quantity})</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">₹{b.totalPrice}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
