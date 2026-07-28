/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void | Promise<void>;
  initialData?: any;
}

export default function UserModal({ isOpen, onClose, onSave, initialData }: UserModalProps) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('ADMIN_DIVISI');
  const [division, setDivision] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setUsername(initialData.username || '');
        setRole(initialData.role || 'ADMIN_DIVISI');
        setDivision(initialData.division || '');
        setPassword('');
        setPin('');
      } else {
        setUsername('');
        setRole('ADMIN_DIVISI');
        setDivision('');
        setPassword('');
        setPin('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!initialData && (!password || !pin)) {
      setError('Password and PIN are required for new users.');
      setLoading(false);
      return;
    }
    
    if (pin && pin.length !== 6) {
      setError('PIN must be exactly 6 characters/digits.');
      setLoading(false);
      return;
    }

    try {
      await onSave({
        username,
        role,
        division: role === 'SUPER_ADMIN' ? null : division,
        password: password || undefined,
        pin: pin || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 text-red-400 rounded-md text-sm">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-shadow"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-neutral-300 mb-1 group relative">
                Role
                <div className="relative flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-500 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2.5 bg-neutral-800 text-neutral-300 text-[11px] rounded shadow-lg z-50 border border-neutral-700 font-normal leading-relaxed">
                    Tingkat hak akses akun ini untuk login ke dalam sistem Vault.
                  </div>
                </div>
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-shadow"
              >
                <option value="ADMIN_DIVISI">Admin Divisi</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            {role === 'ADMIN_DIVISI' && (
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-neutral-300 mb-1 group relative">
                  Division
                  <div className="relative flex items-center">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 p-2.5 bg-neutral-800 text-neutral-300 text-[11px] rounded shadow-lg z-50 border border-neutral-700 font-normal leading-relaxed">
                      Departemen asal karyawan ini bekerja. (Cth: Marketing, Finance)
                    </div>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={division}
                  onChange={e => setDivision(e.target.value)}
                  placeholder="e.g. Marketing, HR"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-shadow"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Password {initialData && <span className="text-neutral-500 text-xs">(Leave blank to keep unchanged)</span>}
              </label>
              <input
                type="password"
                required={!initialData}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                PIN (6 chars) {initialData && <span className="text-neutral-500 text-xs">(Leave blank to keep unchanged)</span>}
              </label>
              <input
                type="password"
                required={!initialData}
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-shadow"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-neutral-300 bg-transparent hover:bg-neutral-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
