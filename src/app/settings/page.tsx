import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateUserProfile } from '@/actions/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Scale, Check } from 'lucide-react';
import Link from 'next/link';
import type { User as UserType } from '@/types';

export default async function SettingsPage() {
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

  const typedUser: UserType | null = typedUserData ? {
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
        <div className="container px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={typedUser?.avatarUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {typedUser?.fullName?.[0] || typedUser?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {typedUser?.fullName || 'User'}
                    </p>
                    <p className="text-muted-foreground">{typedUser?.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Credits Remaining</p>
                      <p className="text-sm text-muted-foreground">
                        You have {typedUser?.credits || 0} free credits
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {typedUser?.credits || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Scale className="h-5 w-5 text-primary" />
                  <CardTitle>Account Type</CardTitle>
                </div>
                <CardDescription>
                  Select how you plan to use LexAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  action={async () => {
                    'use server';
                    await updateUserProfile(user.id, { role: 'citizen' });
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Citizen</p>
                        <p className="text-sm text-muted-foreground">
                          General legal information for personal use
                        </p>
                      </div>
                    </div>
                    {typedUser?.role === 'citizen' && (
                      <div className="p-1 rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </form>

                <form
                  action={async () => {
                    'use server';
                    await updateUserProfile(user.id, { role: 'lawyer' });
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Scale className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Lawyer</p>
                        <p className="text-sm text-muted-foreground">
                          For legal professionals and advocates
                        </p>
                      </div>
                    </div>
                    {typedUser?.role === 'lawyer' && (
                      <div className="p-1 rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="flex items-start gap-3 py-4">
                <Scale className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Legal Disclaimer</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    LexAI provides general legal information only. This is NOT legal advice 
                    and should not be treated as a substitute for professional legal consultation.
                    Always verify information and consult qualified lawyers for specific legal matters.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
