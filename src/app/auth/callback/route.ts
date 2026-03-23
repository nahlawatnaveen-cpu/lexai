import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth error:', error.message);
      return Response.redirect(new URL('/login', request.url), 303);
    }
    
    if (data.user) {
      console.log('User logged in:', data.user.email);
    }
  }

  const redirectUrl = new URL('/dashboard', request.url);
  return Response.redirect(redirectUrl, 303);
}
