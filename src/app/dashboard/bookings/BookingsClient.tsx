"use client";

import React, { useState } from 'react';
import { Plus, Loader2, Trash2, Edit2, Phone, MessageCircle, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BookingsClient({ initialBookings, seasons, products }: { initialBookings: any[], seasons: any[], products: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewBooking, setViewBooking] = useState<any>(null);
  
  const [filterMaterial, setFilterMaterial] = useState<string>('ALL');
  const [filterSize, setFilterSize] = useState<string>('ALL');
  
  const defaultForm = {
    seasonId: seasons[0]?.id || '',
    productId: '',
    customerName: '',
    customerMobile: '',
    quantity: 1,
    totalPrice: '',
    advanceAmount: '',
    pickupDate: '',
  };
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDirectSale, setIsDirectSale] = useState(false);

  const availableProducts = products.filter(p => p.seasonId === formData.seasonId && p.qtyAvailable > 0);
  
  const uniqueSizes = Array.from(new Set(availableProducts.map(p => p.size).filter(Boolean))) as string[];
  
  const filteredProducts = availableProducts.filter(p => {
    if (filterMaterial !== 'ALL' && p.material !== filterMaterial) return false;
    if (filterSize !== 'ALL' && p.size !== filterSize) return false;
    return true;
  });

  const handleProductSelect = (p: any) => {
    setFormData(prev => ({ 
      ...prev, 
      productId: p.id, 
      totalPrice: (p.sellingPrice * prev.quantity).toString() 
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    const selectedProd = products.find(p => p.id === pid);
    if (selectedProd) {
      setFormData(prev => ({ ...prev, productId: pid, totalPrice: (selectedProd.sellingPrice * prev.quantity).toString() }));
    } else {
      setFormData(prev => ({ ...prev, productId: pid }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    const selectedProd = products.find(p => p.id === formData.productId);
    if (selectedProd) {
      setFormData(prev => ({ ...prev, quantity: qty, totalPrice: (selectedProd.sellingPrice * qty).toString() }));
    } else {
      setFormData(prev => ({ ...prev, quantity: qty }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const openDirectSaleModal = () => {
    setFormData(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setImageFile(null);
    setIsDirectSale(true);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setImageFile(null);
    setIsDirectSale(false);
    setIsModalOpen(true);
  };

  const openEditModal = (booking: any) => {
    setFormData({
      seasonId: booking.seasonId,
      productId: booking.productId,
      customerName: booking.customer?.name || '',
      customerMobile: booking.customer?.mobile || '',
      quantity: booking.quantity,
      totalPrice: booking.totalPrice.toString(),
      advanceAmount: booking.advanceAmount.toString(),
      pickupDate: booking.pickupDate ? new Date(booking.pickupDate).toISOString().split('T')[0] : '',
    });
    setIsEditMode(true);
    setEditingId(booking.id);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && editingId) {
        // Handle Edit
        const payload = {
          customerName: formData.customerName,
          customerMobile: formData.customerMobile,
          totalPrice: parseFloat(formData.totalPrice),
          advanceAmount: parseFloat(formData.advanceAmount || '0'),
          balanceAmount: parseFloat(formData.totalPrice) - parseFloat(formData.advanceAmount || '0'),
          pickupDate: formData.pickupDate,
        };

        const res = await fetch(`/api/bookings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update booking');
        toast.success('Booking updated successfully');
      } else {
        // Handle New
        let imageUrl = null;
        if (imageFile) {
          const formDataImg = new FormData();
          formDataImg.append('file', imageFile);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formDataImg,
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error('Image upload failed');
          imageUrl = uploadData.url;
        }

        const payload = {
          ...formData,
          quantity: parseInt(formData.quantity.toString()),
          totalPrice: parseFloat(formData.totalPrice),
          advanceAmount: isDirectSale ? parseFloat(formData.totalPrice) : parseFloat(formData.advanceAmount || '0'),
          imageUrl,
          isDirectSale,
        };

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create booking');
        toast.success('Booking created successfully');

        // Automatically open WhatsApp with confirmed booking message
        const selectedProd = products.find(p => p.id === formData.productId);
        const text = `à¤¨à¤®à¤¸à¥à¤•à¤¾à¤° ${formData.customerName} à¤œà¥€!\n\nà¤—à¤£à¤ªà¤¤à¤¿ à¤¬à¤¾à¤ªà¥à¤ªà¤¾ à¤®à¥‹à¤°à¤¯à¤¾! ðŸ™\nà¤†à¤ªà¤•à¥€ à¤¬à¥à¤•à¤¿à¤‚à¤— à¤•à¤¨à¥à¤«à¤°à¥à¤® à¤¹à¥‹ à¤—à¤ˆ à¤¹à¥ˆà¥¤\n\nðŸ“Œ à¤®à¥‚à¤°à¥à¤¤à¤¿: ${selectedProd?.name || ''} (Qty: ${payload.quantity})\nðŸ’° à¤•à¥à¤² à¤•à¥€à¤®à¤¤: ₹${payload.totalPrice}\nâœ… à¤œà¤®à¤¾ (Advance): ₹${payload.advanceAmount}\nâ— à¤¬à¤¾à¤•à¥€ (Balance): ₹${payload.totalPrice - payload.advanceAmount}\n\nà¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦!`;
        const mobile = formData.customerMobile.replace(/\D/g,'');
        const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(text)}`;
        
        // Open WhatsApp in a new tab
        window.open(url, '_blank');
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Booking deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} bookings?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', bookingIds: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to delete bookings');
      toast.success('Bookings deleted');
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === initialBookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialBookings.map(b => b.id));
    }
  };

  const handleSendWhatsApp = (booking: any) => {
    const text = `à¤¨à¤®à¤¸à¥à¤•à¤¾à¤° ${booking.customer?.name} à¤œà¥€!\n\nà¤—à¤£à¤ªà¤¤à¤¿ à¤¬à¤¾à¤ªà¥à¤ªà¤¾ à¤®à¥‹à¤°à¤¯à¤¾! ðŸ™\nà¤†à¤ªà¤•à¥€ à¤¬à¥à¤•à¤¿à¤‚à¤— à¤•à¤¨à¥à¤«à¤°à¥à¤® à¤¹à¥‹ à¤—à¤ˆ à¤¹à¥ˆà¥¤\n\nðŸ“Œ à¤®à¥‚à¤°à¥à¤¤à¤¿: ${booking.product?.name} (Qty: ${booking.quantity})\nðŸ’° à¤•à¥à¤² à¤•à¥€à¤®à¤¤: ₹${booking.totalPrice}\nâœ… à¤œà¤®à¤¾ (Advance): ₹${booking.advanceAmount}\nâ— à¤¬à¤¾à¤•à¥€ (Balance): ₹${booking.balanceAmount}\n\nà¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦!`;
    const mobile = booking.customer?.mobile.replace(/\D/g,'');
    const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleExportCSV = () => {
    const selectedBookings = initialBookings.filter(b => selectedIds.includes(b.id));
    if (selectedBookings.length === 0) return;

    const headers = ['Booking ID', 'Customer Name', 'Mobile', 'Product', 'Material', 'Qty', 'Total Price', 'Advance', 'Balance', 'Status', 'Date'];
    
    const csvContent = [
      headers.join(','),
      ...selectedBookings.map(b => [
        b.id,
        `"${b.customer?.name}"`,
        `"${b.customer?.mobile}"`,
        `"${b.product?.name}"`,
        `"${b.product?.material}"`,
        b.quantity,
        b.totalPrice,
        b.advanceAmount,
        b.balanceAmount,
        b.status,
        new Date(b.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {selectedIds.length === 0 ? (
          <div className="flex w-full sm:w-auto gap-3">
            <button
              onClick={openNewModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="-ml-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Advance Booking
            </button>
            
            <button
              onClick={openDirectSaleModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border border-transparent bg-emerald-600 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Plus className="-ml-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Direct Sale
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between bg-white dark:bg-slate-800 px-4 py-2.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{selectedIds.length} selected</span>
            
            <div className="flex items-center gap-4">
              <button onClick={handleExportCSV} className="inline-flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600">
                <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>

              <button onClick={handleBulkDelete} disabled={loading} className="inline-flex items-center justify-center text-sm font-medium text-rose-600 hover:text-rose-500 disabled:opacity-50">
                <Trash2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
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
              <th className="px-6 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === initialBookings.length}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Financials</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {initialBookings.map((booking) => (
              <tr 
                key={booking.id} 
                className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedIds.includes(booking.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                onClick={() => setViewBooking(booking)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(booking.id)}
                    onChange={() => toggleSelection(booking.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{booking.customer?.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{booking.customer?.mobile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">{booking.product?.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Qty: {booking.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="text-slate-900 dark:text-white font-medium">Total: ₹{booking.totalPrice}</span>
                  <br />
                  <span className="text-rose-600 dark:text-rose-400 font-medium text-xs">Pending: ₹{booking.balanceAmount}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400' :
                    booking.status === 'BOOKED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-4 sm:gap-5" onClick={(e) => e.stopPropagation()}>
                    <a href={`tel:${booking.customer?.mobile}`} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Call Customer">
                      <Phone className="w-5 h-5" />
                    </a>
                    <button onClick={() => handleSendWhatsApp(booking)} className="text-slate-400 hover:text-emerald-600 transition-colors p-1" title="Send WhatsApp">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                    <button onClick={() => openEditModal(booking)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Edit Booking">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(booking.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1" title="Delete Booking">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initialBookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white" id="modal-title">{isEditMode ? 'Edit Booking' : isDirectSale ? 'New Direct Sale' : 'Create Advance Booking'}</h3>
                    
                    <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Season</label>
                        <select disabled={isEditMode} required name="seasonId" value={formData.seasonId} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border disabled:opacity-50">
                          {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-6 mt-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Customer Details</h4>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Customer Name</label>
                        <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g. Ramesh Kumar" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border placeholder-slate-300 dark:placeholder-slate-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
                        <input required type="tel" name="customerMobile" value={formData.customerMobile} onChange={handleChange} placeholder="e.g. 9876543210" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border placeholder-slate-300 dark:placeholder-slate-500" />
                      </div>

                      {!isEditMode && (
                        <>
                          <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-6 mt-4">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Product Selection</h4>
                          </div>

                          <div className="sm:col-span-2 flex flex-wrap gap-4 mb-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Material</label>
                              <select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} className="block w-auto rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border">
                                <option value="ALL">All Materials</option>
                                <option value="POP">POP</option>
                                <option value="Eco-friendly">Eco-friendly (Shadu Mati)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Size</label>
                              <select value={filterSize} onChange={(e) => setFilterSize(e.target.value)} className="block w-auto rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border">
                                <option value="ALL">All Sizes</option>
                                {uniqueSizes.map(size => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-2 mb-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                              {filteredProducts.map(p => (
                                <div 
                                  key={p.id} 
                                  onClick={() => handleProductSelect(p)}
                                  className={`relative rounded-xl border-2 cursor-pointer transition-all overflow-hidden bg-white dark:bg-slate-800 flex flex-col ${formData.productId === p.id ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                                >
                                  {formData.productId === p.id && (
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5 z-10 shadow-sm">
                                      <CheckSquare className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="h-28 w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative border-b border-slate-100 dark:border-slate-700">
                                    {p.imageUrl ? (
                                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-xs text-slate-400">No Image</span>
                                    )}
                                  </div>
                                  <div className="p-2 flex-1 flex flex-col justify-between">
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                                      <p className="text-[10px] text-slate-500">{p.size || '-'} â€¢ {p.material}</p>
                                    </div>
                                    <div className="mt-2 flex justify-between items-end">
                                      <span className="text-xs font-bold text-emerald-600">₹{p.sellingPrice}</span>
                                      <span className={`text-[10px] font-semibold ${p.qtyAvailable < 5 ? 'text-rose-500' : 'text-slate-500'}`}>{p.qtyAvailable} left</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {filteredProducts.length === 0 && (
                                <div className="col-span-full py-8 text-center text-sm text-slate-500">
                                  No products match the selected filters.
                                </div>
                              )}
                            </div>
                            <input type="hidden" required name="productId" value={formData.productId} />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label>
                            <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleQuantityChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border" />
                          </div>
                        </>
                      )}
                      
                      {!isDirectSale && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Date</label>
                          <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border" />
                        </div>
                      )}

                      {!isEditMode && (
                        <>
                          <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-6 mt-4">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Product Photo (Optional)</h4>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Take Photo or Upload</label>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2" />
                            <p className="mt-1 text-xs text-slate-500">Capture the exact Ganpati selected by the customer to avoid confusion on pickup day.</p>
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-6 mt-4">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Payment Details</h4>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{isDirectSale ? 'Price Paid (₹)' : 'Total Price (₹)'}</label>
                        <input required type="number" step="0.01" name="totalPrice" placeholder="e.g. 5000" value={formData.totalPrice} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 border font-bold placeholder-slate-300 dark:placeholder-slate-500" />
                      </div>
                      {!isDirectSale && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Advance Amount Paid (₹)</label>
                          <input required type="number" step="0.01" min="0" name="advanceAmount" placeholder="e.g. 2000" value={formData.advanceAmount} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-emerald-50 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 px-3 py-2 border font-bold placeholder-emerald-200 dark:placeholder-emerald-800/50" />
                        </div>
                      )}

                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700 pb-20 sm:pb-4 sticky bottom-0 z-10 rounded-b-2xl">
                    <button type="submit" disabled={loading} className="inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 sm:py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : isEditMode ? 'Save Changes' : 'Confirm Booking'}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 sm:mt-0 inline-flex w-full justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 sm:py-2 text-base font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Booking Details Modal */}
      {viewBooking && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setViewBooking(null)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white" id="modal-title">Booking Details</h3>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      viewBooking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400' :
                      viewBooking.status === 'BOOKED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {viewBooking.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer</h4>
                    <p className="text-base font-medium text-slate-900 dark:text-white">{viewBooking.customer?.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">ðŸ“ž {viewBooking.customer?.mobile}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product</h4>
                    <p className="text-base font-medium text-slate-900 dark:text-white">{viewBooking.product?.name} {viewBooking.product?.size ? `(${viewBooking.product?.size})` : ''}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Material: {viewBooking.product?.material}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Quantity: {viewBooking.quantity}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Financials</h4>
                      <p className="text-sm text-slate-900 dark:text-white">Total: <span className="font-semibold">₹{viewBooking.totalPrice}</span></p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Advance: <span className="font-semibold">₹{viewBooking.advanceAmount}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Balance Due</p>
                      <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">₹{viewBooking.balanceAmount}</p>
                    </div>
                  </div>

                  {viewBooking.imageUrl && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Murti Photo</h4>
                      <img src={viewBooking.imageUrl} alt="Ganpati" className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                    </div>
                  )}

                  {viewBooking.pickupDate && (
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
                      ðŸ“… Scheduled Pickup: {new Date(viewBooking.pickupDate).toLocaleDateString()}
                    </p>
                  )}

                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700 pb-20 sm:pb-4 sticky bottom-0 z-10 rounded-b-2xl">
                  <button type="button" onClick={() => setViewBooking(null)} className="mt-3 inline-flex w-full justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 sm:py-2 text-base font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Close
                  </button>
                  <button type="button" onClick={() => { const b = viewBooking; setViewBooking(null); openEditModal(b); }} className="mt-3 sm:mt-0 inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 sm:py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
                    Edit Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


