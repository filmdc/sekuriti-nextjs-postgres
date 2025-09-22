import { redirect } from 'next/navigation';

export default function SystemAdminRedirect() {
  redirect('/admin/dashboard');
}