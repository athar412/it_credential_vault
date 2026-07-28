/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { Eye, Plus, Copy, Trash2, Edit2, CheckCircle2, HelpCircle } from 'lucide-react';
import PinModal from '@/components/PinModal';
import CredentialModal from '@/components/CredentialModal';

export default function CredentialClient({ session }: any) {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinTargetId, setPinTargetId] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinAction, setPinAction] = useState<'reveal'|'save'|'delete'|null>(null);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  const [isCredOpen, setIsCredOpen] = useState(false);
  const [credEditData, setCredEditData] = useState<any>(null);
  
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('/api/credentials');
      const data = await res.json();
      setCredentials(data.credentials || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleReveal = (id: string) => {
    setPinTargetId(id);
    setPinAction('reveal');
    setPinError('');
    setIsPinOpen(true);
  };

  const submitPin = async (pin: string) => {
    setPinLoading(true);
    setPinError('');
    try {
      if (pinAction === 'reveal') {
        const res = await fetch(`/api/credentials/${pinTargetId}/reveal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setRevealedPasswords(prev => ({ ...prev, [pinTargetId!]: data.password }));
        setIsPinOpen(false);
        setTimeout(() => {
          setRevealedPasswords(prev => {
            const next = { ...prev };
            delete next[pinTargetId!];
            return next;
          });
        }, 15000);
      } else if (pinAction === 'save') {
        const res = await fetch(credEditData ? `/api/credentials/${credEditData.id}` : '/api/credentials', {
          method: credEditData ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...pendingFormData, securityPin: pin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setIsPinOpen(false);
        fetchCredentials();
      } else if (pinAction === 'delete') {
        const res = await fetch(`/api/credentials/${pendingDeleteId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ securityPin: pin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setIsPinOpen(false);
        fetchCredentials();
      }
    } catch (err: any) {
      setPinError(err.message);
    } finally {
      setPinLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    setPendingDeleteId(id);
    setPinAction('delete');
    setPinError('');
    setIsPinOpen(true);
  };

  const handleSaveCredential = (formData: any) => {
    setPendingFormData(formData);
    setIsCredOpen(false);
    setPinAction('save');
    setPinError('');
    setIsPinOpen(true);
  };

  const roles = Array.from(new Set(credentials.map(c => c.role)));
  const divisions = Array.from(new Set(credentials.map(c => c.division)));

  const filtered = credentials.filter(c => {
    const matchesSearch = c.platform.toLowerCase().includes(search.toLowerCase()) || 
      c.account.toLowerCase().includes(search.toLowerCase()) ||
      c.division.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = filterRole ? c.role === filterRole : true;
    const matchesDivision = filterDivision ? c.division === filterDivision : true;

    return matchesSearch && matchesRole && matchesDivision;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center group">
            <HelpCircle className="w-5 h-5 text-neutral-500 hover:text-neutral-300 cursor-help transition-colors" />
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-64 p-3 bg-neutral-800 text-neutral-300 text-xs rounded shadow-lg z-50 border border-neutral-700 font-normal leading-relaxed">
              <strong>Credential Vault</strong><br/>
              Halaman ini berisi daftar seluruh kredensial (akun/platform) yang tersimpan. Anda dapat mencari, melihat *password*, serta memfilter berdasarkan Role (jenis akun) dan Divisi yang memilikinya.
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Search credentials..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-white rounded-md px-4 py-2 w-full sm:max-w-xs focus:outline-none focus:border-neutral-600"
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-md px-3 py-2 w-full sm:w-auto focus:outline-none focus:border-neutral-600 text-sm"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterDivision}
            onChange={e => setFilterDivision(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-md px-3 py-2 w-full sm:w-auto focus:outline-none focus:border-neutral-600 text-sm"
          >
            <option value="">All Divisions</option>
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button 
          onClick={() => { setCredEditData(null); setIsCredOpen(true); }}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md font-medium text-sm border border-neutral-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Credential
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase text-xs font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Password</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading credentials...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No credentials found</td></tr>
              ) : filtered.map(cred => (
                <tr key={cred.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{cred.platform}</td>
                  <td className="px-6 py-4">{cred.account}</td>
                  <td className="px-6 py-4">
                    <span className="bg-neutral-800 px-2 py-1 rounded text-xs border border-neutral-700">{cred.division}</span>
                  </td>
                  <td className="px-6 py-4">{cred.role}</td>
                  <td className="px-6 py-4">
                    {revealedPasswords[cred.id] ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white bg-neutral-950 px-2 py-1 rounded border border-neutral-700 select-all tracking-wider">
                          {revealedPasswords[cred.id]}
                        </span>
                        <button onClick={() => handleCopy(revealedPasswords[cred.id], cred.id)} className="text-neutral-400 hover:text-white" title="Copy password">
                          {copiedId === cred.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 tracking-[0.2em] font-mono">••••••••</span>
                        <button onClick={() => handleReveal(cred.id)} className="text-neutral-400 hover:text-white transition-colors p-1" title="Reveal password">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setCredEditData(cred); setIsCredOpen(true); }} className="text-neutral-400 hover:text-white transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cred.id)} className="text-neutral-400 hover:text-white transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PinModal 
        isOpen={isPinOpen} 
        onClose={() => setIsPinOpen(false)} 
        onConfirm={submitPin}
        loading={pinLoading}
        error={pinError}
        title={
          pinAction === 'reveal' ? 'Reveal Password' : 
          pinAction === 'delete' ? 'Delete Credential' : 'Save Credential'
        }
        message={
          pinAction === 'reveal' ? 'Enter your security PIN to reveal this password.' :
          pinAction === 'delete' ? 'Enter your security PIN to permanently delete this credential.' :
          'Enter your security PIN to save these changes.'
        }
      />

      <CredentialModal
        isOpen={isCredOpen}
        onClose={() => setIsCredOpen(false)}
        onSave={handleSaveCredential}
        initialData={credEditData}
        session={session}
      />
    </div>
  );
}
