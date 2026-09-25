"use client";

import React, { useState } from 'react';
import { Search, CheckCircle, IndianRupee, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PickupClient({ initialBookings }: { initialBookings: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | string>('');
  const [loading, setLoading] = useState(false);

  const filteredBookings = initialBookings.filter(b => 
    b.customer.name.toLowerCase().includes(search.toLowerCase()) || 
    b.customer.mobile.includes(search) ||
    b.id.includes(search)
  );

  const handleSelect = (booking: any) => {
    setSelectedBooking(booking);
    setPaymentAmount(booking.balanceAmount); // Default to full balance
  };

  const handleConfirmPickup = async () => {
    if (!selectedBooking) return;
    setLoading(true);

    try {
      const res = await fetch('/api/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          paymentAmount: parseFloat(paymentAmount.toString() || '0'),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm pickup');

      toast.success('Pickup confirmed and marked as completed!');
      setSelectedBooking(null);
      setSearch('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column - Search & List */}
      <div className={`lg:col-span-1 space-y-4 ${selectedBooking ? 'hidden lg:block' : 'block'}`}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
            placeholder="Search name, mobile or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden h-[600px] overflow-y-auto">
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredBookings.length === 0 ? (
              <li className="p-4 text-center text-sm text-slate-500">No pending bookings found.</li>
            ) : (
              filteredBookings.map((booking) => (
                <li 
                  key={booking.id} 
                  className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedBooking?.id === booking.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : ''}`}
                  onClick={() => handleSelect(booking)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{booking.customer.name}</p>
                      <p className="text-xs text-slate-500">{booking.customer.mobile}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Pending: ₹{booking.balanceAmount}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {booking.quantity}x {booking.product.name}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Right Column - Actions */}
      <div className={`lg:col-span-2 ${!selectedBooking ? 'hidden lg:block' : 'block'}`}>
        {selectedBooking ? (
          <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  className="mr-3 p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 lg:hidden transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Booking Details
                </h3>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Customer</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{selectedBooking.customer.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBooking.customer.mobile}</p>
              </div>
              <div>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedBooking.product.name} {selectedBooking.product.size ? `(${selectedBooking.product.size})` : ''} 
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full align-middle ${selectedBooking.product.material === 'Eco-friendly' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {selectedBooking.product.material}
                  </span>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Qty: {selectedBooking.quantity}</p>
              </div>
            </div>

            {selectedBooking.imageUrl && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500 mb-2">Booked Ganpati Photo</p>
                <img src={selectedBooking.imageUrl} alt="Booked Ganpati" className="w-full max-h-64 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
              </div>
            )}

            <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Total Amount:</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">₹{selectedBooking.totalPrice}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Advance Paid:</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">₹{selectedBooking.advanceAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-base font-bold text-slate-900 dark:text-white">Balance Pending:</span>
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">₹{selectedBooking.balanceAmount}</span>
              </div>
            </div>

            {selectedBooking.balanceAmount > 0 && (
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Collect Final Payment (₹)</label>
                <div className="mt-2 relative rounded-md shadow-sm max-w-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <IndianRupee className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 font-bold"
                  />
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.open(`/dashboard/bookings/print?ids=${selectedBooking.id}`, '_blank')}
                className="inline-flex justify-center items-center rounded-xl bg-slate-100 dark:bg-slate-700 px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print Receipt
              </button>
              <button
                onClick={handleConfirmPickup}
                disabled={loading}
                className="flex-1 inline-flex justify-center items-center rounded-xl bg-emerald-600 px-3 py-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <CheckCircle className="-ml-1 mr-2 h-6 w-6" />}
                Confirm Pickup & Mark Completed
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Select a booking</h3>
              <p className="mt-1 text-sm text-slate-500">Search and select a customer from the left list to process their pickup.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


