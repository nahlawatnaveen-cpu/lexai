import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const next = searchParams.get('next') ?? '/dashboard';

  if (errorParam) {
    console.error('OAuth error:', errorParam);
    return NextResponse.redirect(new URL('/login?error=' + errorParam, request.url));
  }

  if (code) {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session exchange error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=no_user', request.url));
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: 'citizen',
        credits: 50,
      } as never);

      if (insertError) {
        console.error('User insert error:', insertError);
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
