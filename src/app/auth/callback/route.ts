import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
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
        
        await supabase.from('users').insert({
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          avatar_url: user.user_metadata?.picture || null,
          role: 'citizen',
          credits: 50,
        } as never);
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
