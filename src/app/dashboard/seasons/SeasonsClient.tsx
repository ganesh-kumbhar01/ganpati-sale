"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeasonsClient({ initialSeasons }: { initialSeasons: any[] }) {
  const router = useRouter();
  const [seasons, setSeasons] = useState(initialSeasons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm = {
    name: '',
    year: new Date().getFullYear(),
    status: 'ACTIVE',
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.name === 'year' ? parseInt(e.target.value) : e.target.value }));
  };

  const openNewModal = () => {
    setFormData(defaultForm);
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (season: any) => {
    setFormData({
      name: season.name,
      year: season.year,
      status: season.status,
    });
    setIsEditMode(true);
    setEditingId(season.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && editingId) {
        const res = await fetch(`/api/seasons/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update season');
        toast.success('Season updated successfully');
      } else {
        const res = await fetch('/api/seasons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create season');
        toast.success('Season created successfully');
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
    if (!confirm('Are you sure you want to delete this season? (Cannot be deleted if there are related products or bookings)')) return;
    try {
      const res = await fetch(`/api/seasons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete season');
      toast.success('Season deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Season
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {seasons.map((season) => (
          <div 
            key={season.id} 
            className="overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => openEditModal(season)}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-indigo-500" aria-hidden="true" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <h3 className="truncate text-lg font-medium text-slate-900 dark:text-white">{season.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Year: {season.year}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 flex justify-between items-center">
              <div className="text-sm">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${season.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {season.status}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/seasons/${season.id}/report`); }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit}>
                  <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white" id="modal-title">
                        {isEditMode ? 'Edit Season' : 'Create New Season'}
                      </h3>
                      {isEditMode && (
                        <button type="button" onClick={() => { setIsModalOpen(false); handleDelete(editingId!); }} className="text-sm font-semibold text-rose-600 hover:text-rose-500 bg-rose-50 px-3 py-1 rounded-md flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Season Name</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ganpati Festival 2027" className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                        <input required type="number" name="year" value={formData.year} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
                      </div>
                      {isEditMode && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                          <select name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border">
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" disabled={loading} className="inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditMode ? 'Save Changes' : 'Create'}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm">
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
