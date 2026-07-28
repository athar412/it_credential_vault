/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, HelpCircle } from 'lucide-react';
import UserModal from '@/components/UserModal';
import PinModal from '@/components/PinModal';

export default function UserClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinAction, setPinAction] = useState<'save'|'delete'|null>(null);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const submitPin = async (pin: string) => {
    setPinLoading(true);
    setPinError('');
    try {
      if (pinAction === 'save') {
        const res = await fetch(editData ? `/api/users/${editData.id}` : '/api/users', {
          method: editData ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...pendingFormData, securityPin: pin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setIsPinOpen(false);
        fetchUsers();
      } else if (pinAction === 'delete') {
        const res = await fetch(`/api/users/${pendingDeleteId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ securityPin: pin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setIsPinOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      setPinError(err.message);
    } finally {
      setPinLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setPendingDeleteId(id);
    setPinAction('delete');
    setPinError('');
    setIsPinOpen(true);
  };

  const handleSaveUser = (formData: any) => {
    setPendingFormData(formData);
    setIsModalOpen(false);
    setPinAction('save');
    setPinError('');
    setIsPinOpen(true);
  };

  const roles = Array.from(new Set(users.map(u => u.role)));
  const divisions = Array.from(new Set(users.map(u => u.division).filter(Boolean)));

  const filtered = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
      (u.division && u.division.toLowerCase().includes(search.toLowerCase())) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesDivision = filterDivision ? u.division === filterDivision : true;

    return matchesSearch && matchesRole && matchesDivision;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center group">
            <HelpCircle className="w-5 h-5 text-neutral-500 hover:text-neutral-300 cursor-help transition-colors" />
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-64 p-3 bg-neutral-800 text-neutral-300 text-xs rounded shadow-lg z-50 border border-neutral-700 font-normal leading-relaxed">
              <strong>User Management</strong><br/>
              Halaman ini digunakan untuk mengelola karyawan yang dapat login ke dalam Vault. Filter tabel ini berdasarkan Role atau Divisi untuk memudahkan pencarian.
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Search users..." 
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
          onClick={() => { setEditData(null); setIsModalOpen(true); }}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md font-medium text-sm border border-neutral-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase text-xs font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No users found</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs border ${user.role === 'SUPER_ADMIN' ? 'bg-blue-900/30 border-blue-800 text-blue-300' : 'bg-neutral-800 border-neutral-700 text-neutral-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.division ? (
                      <span className="bg-neutral-800 px-2 py-1 rounded text-xs border border-neutral-700">{user.division}</span>
                    ) : (
                      <span className="text-neutral-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setEditData(user); setIsModalOpen(true); }} className="text-neutral-400 hover:text-white transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-neutral-400 hover:text-white transition-colors" title="Delete">
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
        title={pinAction === 'delete' ? 'Delete User' : 'Save User'}
        message={
          pinAction === 'delete' 
            ? 'Enter your security PIN to permanently delete this user.' 
            : 'Enter your security PIN to save these changes.'
        }
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editData}
      />
    </div>
  );
}
