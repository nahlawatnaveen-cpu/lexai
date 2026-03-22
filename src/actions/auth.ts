'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signInWithGoogle() {
  const supabase = await createClient();
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexai-roan.vercel.app';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  redirect('/');
}

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string; role?: 'lawyer' | 'citizen' }
) {
  const supabase = await createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  
  if (data.full_name !== undefined) {
    updateData.full_name = data.full_name;
  }
  if (data.role !== undefined) {
    updateData.role = data.role;
  }

  const { error } = await supabase
    .from('users')
    .update(updateData as never)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
}

export async function getUserCredits(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return { used: 0, total: 50, remaining: 50 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData = data as any;
  const remaining = userData?.credits ?? 50;
  return { used: 50 - remaining, total: 50, remaining };
}
