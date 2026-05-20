import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!


  console.log('KEY LENGTH:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY?.length ?? 'UNDEFINED')
  console.log('KEY START:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY?.slice(0, 20) ?? 'UNDEFINED')

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    },
  })
}