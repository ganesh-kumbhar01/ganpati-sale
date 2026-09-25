"use client";

import React, { useEffect } from 'react';

export default function PrintClient({ bookings }: { bookings: any[] }) {
  useEffect(() => {
    // Automatically open print dialog when the page loads
    window.print();
  }, []);

  if (bookings.length === 0) {
    return <div className="p-10 text-center">No bookings found or unauthorized.</div>;
  }

  return (
    <div className="print:m-0 m-8">
      {bookings.map((booking, index) => (
        <div key={booking.id} className="print:break-after-page mb-8 p-8 border border-slate-300 rounded-xl" style={{ pageBreakAfter: 'always' }}>
          
          <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{booking.season.business.name}</h1>
              <p className="text-slate-600 mt-1">{booking.season.business.mobile}</p>
              <p className="text-slate-500 text-sm mt-1">Invoice / Booking Receipt</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold text-slate-900">Receipt #{booking.id.slice(-6).toUpperCase()}</h3>
              <p className="text-sm text-slate-500 mt-1">Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
              <span className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full border ${
                booking.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                booking.status === 'BOOKED' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Details</h4>
              <p className="font-bold text-slate-900 text-lg">{booking.customer.name}</p>
              <p className="text-slate-600">ðŸ“ž {booking.customer.mobile}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pickup Details</h4>
              <p className="text-slate-800">
                {booking.pickupDate 
                  ? `ðŸ“… ${new Date(booking.pickupDate).toLocaleDateString()}` 
                  : 'ðŸ“… Date Not Assigned'}
              </p>
            </div>
          </div>

          <table className="w-full text-left mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-sm">
                <th className="pb-3 font-bold text-slate-900">Product (Murti)</th>
                <th className="pb-3 font-bold text-slate-900 text-center">Material</th>
                <th className="pb-3 font-bold text-slate-900 text-center">Qty</th>
                <th className="pb-3 font-bold text-slate-900 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-4 text-slate-800">
                  <p className="font-semibold">{booking.product.name}</p>
                  {booking.product.size && <p className="text-sm text-slate-500">Size: {booking.product.size}</p>}
                </td>
                <td className="py-4 text-center text-slate-800">{booking.product.material}</td>
                <td className="py-4 text-center text-slate-800">{booking.quantity}</td>
                <td className="py-4 text-right font-semibold text-slate-900">Rs. {booking.totalPrice}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-semibold text-slate-900">Rs. {booking.totalPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Advance Paid:</span>
                <span className="font-semibold text-emerald-600">Rs. {booking.advanceAmount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg">
                <span className="font-bold text-slate-900">Balance Due:</span>
                <span className="font-bold text-rose-600">Rs. {booking.balanceAmount}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm flex justify-between px-8">
            <p>Customer Signature</p>
            <p>Authorized Signatory</p>
          </div>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            <p>Thank you for your business. Ganpati Bappa Morya! ðŸ™</p>
          </div>

        </div>
      ))}
    </div>
  );
}


