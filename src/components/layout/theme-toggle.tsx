'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun
        className={cn(
          'h-5 w-5 rotate-0 scale-100 transition-all',
          theme === 'dark' && '-rotate-90 scale-0'
        )}
      />
      <Moon
        className={cn(
          'absolute h-5 w-5 rotate-90 scale-0 transition-all',
          theme === 'dark' && 'rotate-0 scale-100'
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
