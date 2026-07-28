import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import DashboardNav from '@/components/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 flex flex-col sm:flex-row justify-between sm:items-center sticky top-0 z-10 gap-4 sm:gap-0 pt-4 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20 flex items-center justify-center">
            <Image src="/logo.webp" alt="Logo" width={20} height={20} className="w-6 h-6 object-contain rounded" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white leading-tight">IT Credential Vault</h1>
            <p className="text-xs text-neutral-400">
              {session.role === 'SUPER_ADMIN' ? 'Super Admin Mode' : `${session.division} Division`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto overflow-x-auto pb-4 sm:pb-0 hide-scrollbar">
           <DashboardNav role={session.role} />
          
          <div className="flex items-center gap-4 ml-auto sm:ml-4 border-l border-neutral-800 pl-4 sm:pl-6">
            <span className="text-sm font-medium text-neutral-300 bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-700 whitespace-nowrap">
              {session.username}
            </span>
            <a href="/api/auth/logout" className="text-neutral-400 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-700 p-2 rounded-md border border-transparent hover:border-neutral-600 flex-shrink-0" title="Sign out">
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
