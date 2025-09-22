import { signOut } from '@/app/(login)/actions';
import { redirect } from 'next/navigation';

export async function POST() {
  await signOut();
  redirect('/sign-in');
}