"use client";

import React, { useState } from 'react';
import { Plus, Receipt, Loader2, Trash2, Camera, ImageIcon, Eye, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

export default function ExpensesClient({ initialExpenses, seasons }: { initialExpenses: any[], seasons: any[] }) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null);
  
  const defaultForm = {
    seasonId: seasons[0]?.id || '',
    category: 'Transport',
    amount: '',
    description: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNewModal = () => {
    setFormData(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setReceiptFile(null);
    setExistingReceiptUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setFormData({
      seasonId: exp.seasonId,
      category: exp.category,
      amount: exp.amount.toString(),
      description: exp.description || '',
    });
    setIsEditMode(true);
    setEditingId(exp.id);
    setReceiptFile(null);
    setExistingReceiptUrl(exp.receiptUrl || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let receiptUrl = existingReceiptUrl;

      if (receiptFile) {
        toast.loading('Uploading receipt...', { id: 'upload-toast' });
        
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(receiptFile, options);
        
        const formDataImg = new FormData();
        formDataImg.append('file', compressedFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataImg,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          toast.dismiss('upload-toast');
          throw new Error(uploadData.error || 'Receipt upload failed');
        }
        receiptUrl = uploadData.url;
        toast.dismiss('upload-toast');
      }

      const payload = {
        seasonId: formData.seasonId,
        category: formData.category,
        amount: parseFloat(formData.amount || '0'),
        description: formData.description,
        receiptUrl,
      };

      if (isEditMode && editingId) {
        const res = await fetch(`/api/expenses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update expense');
        toast.success('Expense updated successfully');
      } else {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add expense');
        toast.success('Expense recorded successfully');
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
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      toast.success('Expense deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Expenses Report', 14, 20);
      
      const tableColumn = ["Date", "Category", "Season", "Description", "Amount (Rs)"];
      const tableRows: any[] = [];
      let totalAmount = 0;

      initialExpenses.forEach(exp => {
        const expData = [
          new Date(exp.expenseDate).toLocaleDateString(),
          exp.category,
          exp.season?.name || '-',
          exp.description || '-',
          exp.amount
        ];
        tableRows.push(expData);
        totalAmount += parseFloat(exp.amount || '0');
      });

      tableRows.push(['', '', '', 'Total Expenses', totalAmount.toFixed(2)]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });

      doc.save(`Expenses_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Record Expense
        </button>
        <button
          onClick={exportPDF}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          <FileDown className="-ml-1 mr-2 h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Season</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Receipt</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {initialExpenses.map((exp) => (
              <tr 
                key={exp.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => openEditModal(exp)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  {new Date(exp.expenseDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{exp.category}</div>
                      <div className="text-xs text-slate-500">{exp.description || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {exp.season?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                  ₹{exp.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {exp.receiptUrl ? (
                    <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center p-2 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors" title="View Receipt">
                      <Eye className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 inline-flex" title="Delete Expense">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initialExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No expenses recorded yet.
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
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white" id="modal-title">
                        {isEditMode ? 'Expense Details' : 'Record New Expense'}
                      </h3>
                      {isEditMode && (
                        <button type="button" onClick={() => { setIsModalOpen(false); handleDelete(editingId!); }} className="text-sm font-semibold text-rose-600 hover:text-rose-500 bg-rose-50 px-3 py-1 rounded-md flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Season</label>
                        <select required name="seasonId" value={formData.seasonId} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border">
                          {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select required name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border">
                          <option value="Transport">Transport / Tempo</option>
                          <option value="Ganpati Purchase">Ganpati Purchase (Stock)</option>
                          <option value="Labour">Labour / Hamali</option>
                          <option value="Shop Rent">Shop Rent</option>
                          <option value="Decoration">Decoration / Mandap</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
                        <input required type="number" min="0" step="0.01" name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. 500" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description (Optional)</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="e.g. Paid to driver Ramu" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border"></textarea>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Receipt / Bill Photo (Optional)</label>
                        <div className="flex gap-2 mt-1">
                          <label className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1 py-3 px-2 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                            <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Take Photo</span>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                          </label>
                          <label className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1 py-3 px-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">From Gallery</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        </div>
                        {receiptFile && (
                          <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between border border-indigo-100 dark:border-indigo-800/30">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">{receiptFile.name}</span>
                            <button type="button" onClick={() => setReceiptFile(null)} className="text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-md">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {!receiptFile && existingReceiptUrl && (
                          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Existing receipt attached</span>
                            <a href={existingReceiptUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 text-xs font-semibold">
                              <Eye className="w-3 h-3" /> View
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700 pb-10 sm:pb-4 sticky bottom-0 z-10 rounded-b-2xl">
                    <button type="submit" disabled={loading} className="inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 sm:py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditMode ? 'Save Changes' : 'Save Expense'}
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
    </div>
  );
}
