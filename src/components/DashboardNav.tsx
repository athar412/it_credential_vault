'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KeyRound, Users } from 'lucide-react';

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 text-sm font-medium">
      <Link 
        href="/dashboard" 
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          pathname === '/dashboard' 
            ? 'text-white bg-neutral-800/80 font-semibold' 
            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
        }`}
      >
        <KeyRound className="w-4 h-4" />
        Credentials
      </Link>
      
      {role === 'SUPER_ADMIN' && (
        <Link 
          href="/dashboard/users" 
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            pathname === '/dashboard/users' 
              ? 'text-white bg-neutral-800/80 font-semibold' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </Link>
      )}
    </nav>
  );
}
