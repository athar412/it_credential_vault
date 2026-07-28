import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CredentialClient from './CredentialClient';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return <CredentialClient session={session} />;
}
