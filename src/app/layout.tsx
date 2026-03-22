import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LexAI - AI-Powered Legal Assistant for India',
  description: 'Get instant legal guidance on Indian law. Draft documents, search case law, and understand your rights with AI assistance.',
  keywords: ['legal assistant', 'Indian law', 'AI lawyer', 'IPC', 'CrPC', 'CPC', 'legal documents'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
