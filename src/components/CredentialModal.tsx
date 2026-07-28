/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

export default function CredentialModal({ isOpen, onClose, onSave, initialData, session }: any) {
  const [formData, setFormData] = useState({
    platform: '', account: '', division: session?.division || '', role: '', password: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: '' });
    } else {
      setFormData({ platform: '', account: '', division: session?.role === 'SUPER_ADMIN' ? '' : session?.division, role: '', password: '' });
    }
  }, [initialData, session, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-6">{initialData ? 'Edit Credential' : 'Add Credential'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Platform</label>
            <input type="text" value={formData.platform} onChange={e=>setFormData({...formData, platform: e.target.value})} required className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Account (Email/User)</label>
            <input type="text" value={formData.account} onChange={e=>setFormData({...formData, account: e.target.value})} required className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-neutral-400 mb-1 group relative">
              Division
              <div className="relative flex items-center">
                <HelpCircle className="w-3 h-3 text-neutral-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2.5 bg-neutral-800 text-neutral-300 text-[11px] rounded shadow-lg z-50 border border-neutral-700 font-normal leading-relaxed">
                  Divisi mana yang memiliki/berhak menggunakan kredensial ini. (Cth: Marketing)
                </div>
              </div>
            </label>
            <input type="text" value={formData.division} onChange={e=>setFormData({...formData, division: e.target.value})} required disabled={session?.role !== 'SUPER_ADMIN'} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-neutral-400 mb-1 group relative">
              Role
              <div className="relative flex items-center">
                <HelpCircle className="w-3 h-3 text-neutral-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2.5 bg-neutral-800 text-neutral-300 text-[11px] rounded shadow-lg z-50 border border-neutral-700 font-normal leading-relaxed">
                  Tingkat akses dari akun/platform ini. (Cth: Editor, IAM ReadOnly)
                </div>
              </div>
            </label>
            <input type="text" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} required className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">{initialData ? 'New Password (Leave blank to keep)' : 'Password'}</label>
            <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required={!initialData} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
