"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    ownerName: initialData.ownerName || '',
    mobile: initialData.mobile || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      toast.success('Settings updated successfully!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Owner Name</label>
          <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number</label>
          <input required type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-slate-900 px-3 py-2 border" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Save Changes
        </button>
      </div>
    </form>
  );
}
