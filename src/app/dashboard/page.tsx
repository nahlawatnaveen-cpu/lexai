import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChats } from '@/actions/chat';
import { getDocuments } from '@/actions/documents';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, Search, Sparkles, ArrowRight, Clock, Coins } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedUserData = userData as any;

  const chats = await getChats();
  const documents = await getDocuments();

  const typedUser: User | null = typedUserData ? {
    id: typedUserData.id,
    email: typedUserData.email,
    fullName: typedUserData.full_name,
    avatarUrl: typedUserData.avatar_url,
    role: typedUserData.role as 'lawyer' | 'citizen',
    credits: typedUserData.credits ?? 50,
    createdAt: typedUserData.created_at,
    updatedAt: typedUserData.updated_at,
  } : null;

  const quickActions = [
    {
      title: 'Ask Legal Question',
      description: 'Get AI-powered legal guidance',
      icon: Sparkles,
      href: '/chat',
      color: 'text-primary',
    },
    {
      title: 'Draft Document',
      description: 'Create legal documents',
      icon: FileText,
      href: '/documents/new',
      color: 'text-green-600',
    },
    {
      title: 'Search Case Law',
      description: 'Find relevant judgments',
      icon: Search,
      href: '/search',
      color: 'text-purple-600',
    },
    {
      title: 'View Chats',
      description: 'See your conversations',
      icon: MessageSquare,
      href: '/chat/history',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={typedUser} />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, {typedUserData?.full_name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your AI-powered legal assistant is ready to help
                </p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Coins className="h-5 w-5" />
                <span className="font-semibold">{typedUser?.credits || 0} credits remaining</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {action.title}
                      </CardTitle>
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Chats</CardTitle>
                      <CardDescription>Your recent conversations with LexAI</CardDescription>
                    </div>
                    <Link href="/chat">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View All <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {chats.length > 0 ? (
                    <div className="space-y-4">
                      {chats.slice(0, 5).map((chat: any) => (
                        <Link
                          key={chat.id}
                          href={`/chat/${chat.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="p-2 rounded-full bg-primary/10">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{chat.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(chat.updated_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">No chats yet</p>
                      <Link href="/chat">
                        <Button className="mt-4" size="sm">
                          Start a Conversation
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Documents</CardTitle>
                      <CardDescription>Your drafted legal documents</CardDescription>
                    </div>
                    <Link href="/documents">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View All <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.slice(0, 5).map((doc: any) => (
                        <Link
                          key={doc.id}
                          href={`/documents/${doc.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="p-2 rounded-full bg-green-500/10">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {new Date(doc.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-4 text-muted-foreground">No documents yet</p>
                      <Link href="/documents/new">
                        <Button className="mt-4" size="sm">
                          Create Document
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-purple-50 dark:from-primary/10 dark:to-purple-950">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
                <div>
                  <h3 className="font-semibold text-lg">Need help understanding the law?</h3>
                  <p className="text-muted-foreground text-sm">
                    Ask LexAI about any legal topic related to Indian law
                  </p>
                </div>
                <Link href="/chat">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Ask Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
