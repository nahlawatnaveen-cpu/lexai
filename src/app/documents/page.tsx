import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDocuments } from '@/actions/documents';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteDocument } from '@/actions/documents';
import type { User } from '@/types';

export default async function DocumentsPage() {
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={typedUser} />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
              <p className="text-muted-foreground">
                Create and manage your legal documents
              </p>
            </div>
            <Link href="/documents/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Document
              </Button>
            </Link>
          </div>

          {documents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc: any) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {doc.type}
                      </span>
                    </div>
                    <CardTitle className="mt-4">{doc.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link href={`/documents/${doc.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          View <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form
                        action={async () => {
                          'use server';
                          await deleteDocument(doc.id);
                        }}
                      >
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first legal document with AI assistance
                </p>
                <Link href="/documents/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Document
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
