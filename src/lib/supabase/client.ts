import { createBrowserClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          return document.cookie.split('; ').map(cookie => {
            const [name, ...value] = cookie.split('=');
            return { name, value: value.join('=') };
          });
        },
        setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
          if (typeof document === 'undefined') return;
          cookies.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=${options?.path || '/'}; max-age=${options?.maxAge || 31536000}; samesite=${options?.sameSite || 'lax'}`;
          });
        },
      },
    }
  );
}
