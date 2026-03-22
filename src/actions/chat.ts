'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { generateResponse } from '@/lib/ai/openai';

export async function createChat(title?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      title: title || 'New Conversation',
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
  return data;
}

export async function getChats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages (
        id,
        content,
        role,
        created_at
      )
    ` as never)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false } as never);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getChat(chatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('chats')
    .select(`
      *,
      messages (
        id,
        content,
        role,
        created_at
      )
    ` as never)
    .eq('id', chatId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteChat(chatId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
}

export async function sendMessage(
  chatId: string,
  content: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credits = (userData as any)?.credits ?? 50;
  
  if (credits <= 0) {
    throw new Error('Insufficient credits');
  }

  await supabase.from('messages').insert({
    chat_id: chatId,
    role: 'user',
    content,
  } as never);

  const messages = conversationHistory.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const response = await generateResponse(messages, user.id);

  await supabase.from('messages').insert({
    chat_id: chatId,
    role: 'assistant',
    content: response,
  } as never);

  if (chatId === 'new') {
    const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    await supabase
      .from('chats')
      .update({ 
        title,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', chatId);
  } else {
    await supabase
      .from('chats')
      .update({ 
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', chatId);
  }

  revalidatePath('/dashboard');
  return response;
}

export async function updateChatTitle(chatId: string, title: string) {
  const supabase = await createClient();
  
  await supabase
    .from('chats')
    .update({ 
      title,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', chatId);

  revalidatePath('/dashboard');
}
