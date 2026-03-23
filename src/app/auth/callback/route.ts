import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth error:', error.message);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
    
    if (data.user) {
      console.log('User logged in:', data.user.email);
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
