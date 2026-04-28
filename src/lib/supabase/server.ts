import { createClient } from '@supabase/supabase-js'

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url?.trim()) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL이 설정되어 있지 않습니다. .env.local을 확인하세요.'
    )
  }
  if (!serviceRoleKey?.trim()) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다. .env.local을 확인하세요.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
