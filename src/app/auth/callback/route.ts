import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  console.log('Callback hit:', { code: code ? 'present' : 'missing', error: errorParam });

  if (errorParam) {
    console.error('OAuth error:', errorParam);
    return NextResponse.redirect(new URL('/login?error=' + errorParam, request.url));
  }

  if (!code) {
    console.error('No code in callback');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('Code exchange:', { userId: user?.id, error: error?.message });

    if (error || !user) {
      console.error('Session exchange failed:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      const fullName = user.user_metadata?.name || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'User';
      
      console.log('Creating user:', { id: user.id, email: user.email, name: fullName });
      
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email || '',
        full_name: fullName,
        avatar_url: user.user_metadata?.picture || null,
        role: 'citizen',
        credits: 50,
      } as never);

      if (insertError) {
        console.error('User creation failed:', insertError);
      }
    }

    console.log('Redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
}
