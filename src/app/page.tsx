import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scale, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '@/actions/auth';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">LexAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  AI-Powered Legal Assistant
                  <br />
                  <span className="text-primary">for India</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Get instant legal guidance on Indian law. Draft documents, search case law, 
                  and understand your rights with AI assistance.
                </p>
              </div>
              <div className="space-x-4">
                <form action={signInWithGoogle}>
                  <Button size="lg" type="submit" className="gap-2">
                    Continue with Google
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              <p className="text-sm text-muted-foreground">
                Free to start with 50 credits. No credit card required.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Ask Legal Questions</h3>
                <p className="text-muted-foreground">
                  Get answers about IPC, CrPC, CPC, and Indian Constitution. 
                  Supports Hindi and English queries.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Draft Legal Documents</h3>
                <p className="text-muted-foreground">
                  Generate professional FIRs, notices, agreements, petitions, 
                  and more with AI assistance.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Search Case Law</h3>
                <p className="text-muted-foreground">
                  Find relevant Supreme Court and High Court judgments 
                  with AI-powered summarization.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">
                Privacy-First Legal Assistance
              </h2>
              <p className="text-muted-foreground">
                All your chats and documents are private and secure. Only you can access them.
                We never share your data with third parties.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <div className="mx-auto max-w-[600px] space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground">
                Join thousands of users who trust LexAI for their legal information needs.
              </p>
              <form action={signInWithGoogle}>
                <Button size="lg" type="submit" className="gap-2">
                  Continue with Google
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-semibold">LexAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LexAI. All rights reserved.
            </p>
            <p className="text-sm text-yellow-600">
              ⚠️ Not a substitute for professional legal advice
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
