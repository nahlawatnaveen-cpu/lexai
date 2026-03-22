import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('Callback received - code:', !!code, 'next:', next);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('Session result:', { hasUser: !!data?.user, error: error?.message });
  }

  console.log('Redirecting to:', next);
  return Response.redirect(new URL(next, request.url), 303);
}
