'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getDocuments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*' as never)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false } as never);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getDocument(documentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*' as never)
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveDocument(data: {
  title: string;
  type: string;
  content: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      ...data,
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/documents');
  return doc;
}

export async function updateDocument(
  documentId: string,
  data: { title?: string; content?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('documents')
    .update({ 
      ...data,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', documentId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/documents');
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/documents');
}
