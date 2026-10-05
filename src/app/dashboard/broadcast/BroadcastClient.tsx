"use client";

import React, { useState, useEffect } from 'react';
import { Megaphone, Send, CheckCircle2, RotateCcw, Link as LinkIcon, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BroadcastClient({ customers }: { customers: any[] }) {
  const [message, setMessage] = useState("नमस्कार! हमारा नया कैटलॉग आ गया है। कृपया नीचे दी गई लिंक पर क्लिक करके डिज़ाइन देखें।");
  const [linkUrl, setLinkUrl] = useState("");
  const [sentStatus, setSentStatus] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  // Load sent status from local storage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('broadcast_progress');
    if (saved) {
      try {
        setSentStatus(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSend = (customer: any) => {
    if (!customer.mobile) {
      toast.error('No mobile number for this customer');
      return;
    }

    let fullMessage = `नमस्कार ${customer.name} जी! 🙏\n\n${message}`;
    if (linkUrl) {
      fullMessage += `\n\nलिंक: ${linkUrl}`;
    }

    const mobile = customer.mobile.replace(/\D/g, '');
    const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');

    // Mark as sent
    const newStatus = { ...sentStatus, [customer.id]: true };
    setSentStatus(newStatus);
    localStorage.setItem('broadcast_progress', JSON.stringify(newStatus));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear your broadcast progress? This will reset all customers to "Not Sent".')) {
      setSentStatus({});
      localStorage.removeItem('broadcast_progress');
      toast.success('Progress cleared');
    }
  };

  const sentCount = customers.filter(c => sentStatus[c.id]).length;
  const totalCount = customers.length;
  const progressPercent = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-500" /> WhatsApp Broadcast
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Send a custom message or PDF link to all your customers one by one.</p>
        </div>
        {sentCount > 0 && (
          <button onClick={handleReset} className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg font-medium transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset Progress
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Composer */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Compose Message
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message Text</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  placeholder="Type your message here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5" /> PDF / Drive Link (Optional)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-2 uppercase tracking-wider">Preview</p>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                  नमस्कार [Name] जी! 🙏<br/><br/>
                  {message}
                  {linkUrl && <><br/><br/>लिंक: <a href={linkUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">{linkUrl}</a></>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-200px)] max-h-[800px]">
            
            {/* Progress Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Broadcast Progress</span>
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{sentCount} / {totalCount} Sent</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-0">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                <thead className="bg-white dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {customers.map((customer) => {
                    const isSent = sentStatus[customer.id];
                    return (
                      <tr key={customer.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isSent ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-white">{customer.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{customer.mobile}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleSend(customer)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isSent 
                                ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                          >
                            <Send className="w-4 h-4 mr-1.5" />
                            {isSent ? 'Send Again' : 'Send'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
