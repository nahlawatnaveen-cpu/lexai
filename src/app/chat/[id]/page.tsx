import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChat } from '@/actions/chat';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ChatWithHistory } from './chat-with-history';
import type { User } from '@/types';

export default async function ChatHistoryPage({
  params,
}: {
  params: { id: string };
}) {
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

  const chat = await getChat(params.id);

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
        <ChatWithHistory chat={chat} userId={user.id} />
      </main>

      <Footer />
    </div>
  );
}
