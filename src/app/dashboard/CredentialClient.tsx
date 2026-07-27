'use client';
import { useState, useEffect } from 'react';
import { Eye, Plus, Copy, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import PinModal from '@/components/PinModal';
import CredentialModal from '@/components/CredentialModal';

export default function CredentialClient({ session }: any) {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinTargetId, setPinTargetId] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  
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
    setPinError('');
    setIsPinOpen(true);
  };

  const submitPin = async (pin: string) => {
    setPinLoading(true);
    setPinError('');
    try {
      const res = await fetch(`/api/credentials/${pinTargetId}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setRevealedPasswords(prev => ({ ...prev, [pinTargetId!]: data.password }));
      setIsPinOpen(false);
      
      // Auto-hide after 15 seconds
      setTimeout(() => {
        setRevealedPasswords(prev => {
          const next = { ...prev };
          delete next[pinTargetId!];
          return next;
        });
      }, 15000);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    try {
      await fetch(`/api/credentials/${id}`, { method: 'DELETE' });
      fetchCredentials();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCredential = async (formData: any) => {
    try {
      if (credEditData) {
        await fetch(`/api/credentials/${credEditData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsCredOpen(false);
      fetchCredentials();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = credentials.filter(c => 
    c.platform.toLowerCase().includes(search.toLowerCase()) || 
    c.account.toLowerCase().includes(search.toLowerCase()) ||
    c.division.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="Search credentials..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-white rounded-md px-4 py-2 w-full max-w-sm focus:outline-none focus:border-neutral-600"
        />
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
