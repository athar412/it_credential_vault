/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

export default function CredentialModal({ isOpen, onClose, onSave, initialData, session }: any) {
  const [formData, setFormData] = useState({
    platform: '', account: '', division: session?.division || '', role: '', password: '',
    isPasswordless: false, has2FA: false, twoFAMethod: '', accessUsers: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData, 
        password: '',
        isPasswordless: initialData.isPasswordless || false,
        has2FA: initialData.has2FA || false,
        twoFAMethod: initialData.twoFAMethod || '',
        accessUsers: initialData.accessUsers || ''
      });
    } else {
      setFormData({ 
        platform: '', account: '', division: session?.role === 'SUPER_ADMIN' ? '' : session?.division, role: '', password: '',
        isPasswordless: false, has2FA: false, twoFAMethod: '', accessUsers: ''
      });
    }
  }, [initialData, session, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
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
            <label className="block text-xs font-medium text-neutral-400 mb-1">{initialData && !formData.isPasswordless ? 'New Password (Leave blank to keep)' : 'Password'}</label>
            <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required={!initialData && !formData.isPasswordless} disabled={formData.isPasswordless} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" placeholder={formData.isPasswordless ? "Disabled for passwordless login" : ""} />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="isPasswordless" checked={formData.isPasswordless} onChange={e=>setFormData({...formData, isPasswordless: e.target.checked, password: ''})} className="w-4 h-4 bg-neutral-950 border-neutral-800 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-900" />
            <label htmlFor="isPasswordless" className="text-xs font-medium text-neutral-300 cursor-pointer">Login Tanpa Password (Email Only / Magic Link)</label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="has2FA" checked={formData.has2FA} onChange={e=>setFormData({...formData, has2FA: e.target.checked})} className="w-4 h-4 bg-neutral-950 border-neutral-800 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-900" />
            <label htmlFor="has2FA" className="text-xs font-medium text-neutral-300 cursor-pointer">Membutuhkan 2FA / Verifikasi Ke-2</label>
          </div>

          {formData.has2FA && (
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Metode 2FA</label>
              <input type="text" value={formData.twoFAMethod} onChange={e=>setFormData({...formData, twoFAMethod: e.target.value})} placeholder="Contoh: OTP ke email pa albert" required className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Pengguna akses (Tulis Nama Staff)</label>
            <input type="text" value={formData.accessUsers} onChange={e=>setFormData({...formData, accessUsers: e.target.value})} placeholder="Contoh: Budi, Andi" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
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
