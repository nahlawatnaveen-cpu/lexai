import { Scale, Shield } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">LexAI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-Powered Legal Assistant for India. Making legal information accessible to everyone.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/chat" className="hover:text-foreground">Ask LexAI</Link></li>
              <li><Link href="/documents" className="hover:text-foreground">Documents</Link></li>
              <li><Link href="/search" className="hover:text-foreground">Case Law Search</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Legal Disclaimer</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    LexAI provides general legal information only. This is NOT legal advice 
                    and should not be treated as a substitute for professional legal consultation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LexAI. All rights reserved.
            </p>
            <p className="text-sm text-yellow-600 font-medium">
              ⚠️ Not a substitute for professional legal advice
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
