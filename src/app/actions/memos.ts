'use server'

import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData } from '@/types/memo'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MemoRow, rowToMemo } from '@/utils/memoDb'

export async function getMemosAction(): Promise<Memo[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as MemoRow[]).map(rowToMemo)
}

export async function createMemoAction(formData: MemoFormData): Promise<Memo> {
  const supabase = createSupabaseServerClient()
  const id = uuidv4()
  const now = new Date().toISOString()

  const row = {
    id,
    title: formData.title,
    content: formData.content,
    category: formData.category,
    tags: formData.tags,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await supabase
    .from('memos')
    .insert(row)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return rowToMemo(data as MemoRow)
}

export async function updateMemoAction(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return rowToMemo(data as MemoRow)
}

export async function deleteMemoAction(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function clearAllMemosAction(): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('memos')
    .delete()
    .gte('created_at', '1970-01-01T00:00:00.000Z')

  if (error) {
    throw new Error(error.message)
  }
}
