import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserClient from './UserClient';

export default async function UsersPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  if (session.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return <UserClient />;
}
