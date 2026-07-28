/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { Lock, X } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onConfirm, loading, error, title, message }: any) {
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onConfirm(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-white">{title || 'Security PIN Required'}</h2>
          <p className="text-xs text-neutral-400 text-center mt-1">
            {message || 'Enter your security PIN to reveal this password.'}
          </p>
        </div>

        {error && <div className="mb-4 text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 text-center text-2xl tracking-widest text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 mb-4"
            autoFocus
            required
            maxLength={6}
          />
          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
