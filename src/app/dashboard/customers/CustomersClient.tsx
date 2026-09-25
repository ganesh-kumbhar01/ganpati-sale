"use client";

import React, { useState } from 'react';
import { Users, Search, Phone, MessageCircle, FileText, Star, Edit3, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'SPEND'>('DEFAULT');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const customersWithData = initialCustomers.map(c => ({
    ...c,
    totalSpent: c.bookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)
  }));

  let processedCustomers = [...customersWithData];
  if (sortBy === 'SPEND') {
    processedCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
  } else {
    // Sort starred first
    processedCustomers.sort((a, b) => (b.isStarred === a.isStarred ? 0 : b.isStarred ? 1 : -1));
  }

  const filteredCustomers = processedCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mobile.includes(searchTerm)
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const handleExportCSV = () => {
    const selectedCustomers = initialCustomers.filter(c => selectedIds.includes(c.id));
    if (selectedCustomers.length === 0) return;

    const headers = ['Customer ID', 'Name', 'Mobile', 'Type', 'Total Bookings', 'Starred', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...selectedCustomers.map(c => [
        c.id,
        `"${c.name}"`,
        `"${c.mobile}"`,
        c.customerType,
        c.bookings.length,
        c.isStarred ? 'Yes' : 'No',
        `"${c.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCustomerModal = (customer: any) => {
    setViewCustomer(customer);
    setNotesTemp(customer.notes || '');
    setEditingNotes(false);
  };

  const handleToggleStar = async (customer: any) => {
    const newValue = !customer.isStarred;
    // Optimistic update in local state
    if (viewCustomer && viewCustomer.id === customer.id) {
      setViewCustomer({ ...viewCustomer, isStarred: newValue });
    }
    
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: newValue }),
      });
      if (!res.ok) throw new Error('Failed to update star');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!viewCustomer) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/customers/${viewCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesTemp }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
      toast.success('Notes saved');
      setViewCustomer({ ...viewCustomer, notes: notesTemp });
      setEditingNotes(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSendWhatsApp = (customer: any) => {
    const text = `à¤¨à¤®à¤¸à¥à¤•à¤¾à¤° ${customer.name} à¤œà¥€!\nà¤—à¤£à¤ªà¤¤à¤¿ à¤¬à¤¾à¤ªà¥à¤ªà¤¾ à¤®à¥‹à¤°à¤¯à¤¾! ðŸ™`;
    const mobile = customer.mobile.replace(/\D/g,'');
    const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'DEFAULT' | 'SPEND')}
            className="block w-full sm:w-auto rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          >
            <option value="DEFAULT">Sort by Default</option>
            <option value="SPEND">Sort by Spend (High to Low)</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between sm:justify-start gap-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-full lg:w-auto">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">{selectedIds.length} selected</span>
            
            <button onClick={handleExportCSV} className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export CSV
            </button>
          </div>
        )}
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
              <th className="px-6 py-3 text-left w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredCustomers.length}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Bookings & Spend</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Purchased Items</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedIds.includes(customer.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                onClick={() => openCustomerModal(customer)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(customer.id)}
                    onChange={() => toggleSelection(customer.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center relative">
                      <Users className="h-5 w-5 text-indigo-500" />
                      {customer.isStarred && (
                        <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {customer.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {customer.customerType === 'NEW' ? 'New Customer' : 'Returning Customer'}
                        {customer.notes && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has notes"></span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {customer.mobile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {customer.bookings.length} <span className="text-xs text-slate-500 font-normal">orders</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{customer.totalSpent}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap gap-2 max-w-[200px] truncate">
                    {customer.bookings.slice(0, 2).map((b: any) => (
                      <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 truncate max-w-full">
                        {b.product?.name}
                      </span>
                    ))}
                    {customer.bookings.length > 2 && <span className="text-xs text-slate-400">+{customer.bookings.length - 2} more</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-4 sm:gap-5">
                    <button 
                      onClick={() => handleToggleStar(customer)} 
                      className="text-slate-400 hover:text-yellow-500 transition-colors p-1" 
                      title={customer.isStarred ? "Remove Star" : "Add Star"}
                    >
                      <Star className={`w-5 h-5 ${customer.isStarred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                    </button>
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                    <a href={`tel:${customer.mobile}`} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Call Customer">
                      <Phone className="w-5 h-5" />
                    </a>
                    <button onClick={() => handleSendWhatsApp(customer)} className="text-slate-400 hover:text-emerald-600 transition-colors p-1" title="Send WhatsApp">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No customers found. Customers are added automatically when you make a booking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Customer Details Modal */}
      {viewCustomer && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setViewCustomer(null)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-3xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="px-4 pb-24 pt-5 sm:p-6 sm:pb-6">
                  
                  {/* Header Actions */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {viewCustomer.name}
                          <button onClick={() => handleToggleStar(viewCustomer)}>
                            <Star className={`w-5 h-5 ${viewCustomer.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400'}`} />
                          </button>
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center flex-wrap gap-2">
                          <span>ðŸ“ž {viewCustomer.mobile}</span>
                          <span className="hidden sm:inline">&bull;</span>
                          <span>{viewCustomer.customerType}</span>
                          <span className="hidden sm:inline">&bull;</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Total Spent: ₹{viewCustomer.totalSpent}</span>
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-slate-500">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                    <a href={`tel:${viewCustomer.mobile}`} className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </a>
                    <button onClick={() => handleSendWhatsApp(viewCustomer)} className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                    </button>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Column: CRM Notes */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Internal Notes</h4>
                        {!editingNotes && (
                          <button onClick={() => setEditingNotes(true)} className="text-xs text-indigo-600 font-medium hover:underline flex items-center">
                            <Edit3 className="w-3 h-3 mr-1" /> Edit
                          </button>
                        )}
                      </div>
                      
                      {editingNotes ? (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-700/50">
                          <textarea 
                            value={notesTemp}
                            onChange={(e) => setNotesTemp(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white mb-2 min-h-[100px] focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Add important notes about this customer (e.g. Needs discount, calls late at night...)"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingNotes(false)} className="text-xs px-3 py-1.5 text-slate-600 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                            <button onClick={handleSaveNotes} disabled={savingNotes} className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">Save Note</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-xl border ${viewCustomer.notes ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-700/50' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                          {viewCustomer.notes ? (
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{viewCustomer.notes}</p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">No notes added. Click edit to add a note.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Booking History */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Booking History ({viewCustomer.bookings.length})</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {viewCustomer.bookings.map((booking: any) => (
                          <div key={booking.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.product?.name}</p>
                              <span className="text-xs font-bold text-slate-500">{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                              <span>Qty: {booking.quantity}</span>
                              <span className="font-semibold text-slate-900 dark:text-white">₹{booking.totalPrice}</span>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                booking.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                booking.status === 'BOOKED' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                'border-slate-200 bg-slate-50 text-slate-700'
                              }`}>
                                {booking.status}
                              </span>
                              {booking.balanceAmount > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded border border-rose-200 bg-rose-50 text-rose-700">
                                  Pending: ₹{booking.balanceAmount}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {viewCustomer.bookings.length === 0 && (
                          <p className="text-sm text-slate-500">No bookings found.</p>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


