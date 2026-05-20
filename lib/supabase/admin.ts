export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY 
    || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log('ADMIN KEY TYPE:', 
    process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' :
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? 'next_public_service' :
    'anon_fallback'
  )

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}