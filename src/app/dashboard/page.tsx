import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CredentialClient from './CredentialClient';
import { LogOut, Shield } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white leading-tight">IT Credential Vault</h1>
            <p className="text-xs text-neutral-400">
              {session.role === 'SUPER_ADMIN' ? 'Super Admin Mode' : `${session.division} Division`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-300 bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-700">
            {session.username}
          </span>
          <a href="/api/auth/logout" className="text-neutral-400 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-700 p-2 rounded-md border border-transparent hover:border-neutral-600" title="Sign out">
            <LogOut className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <CredentialClient session={session} />
      </main>
    </div>
  );
}
