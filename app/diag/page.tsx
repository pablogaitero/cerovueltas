import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function DiagPage() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '14px' }}>
      <h1>Diagnóstico de Sesión</h1>
      
      <h2>Cookies ({allCookies.length}):</h2>
      <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(allCookies.map(c => ({ name: c.name, value: c.value.slice(0, 30) + '...' })), null, 2)}
      </pre>

      <h2>Usuario:</h2>
      <pre style={{ background: '#f0f0f0', padding: '1rem' }}>
        {JSON.stringify({ user: user?.email ?? null, error: error?.message ?? null }, null, 2)}
      </pre>

      <h2>Sesión:</h2>
      <pre style={{ background: '#f0f0f0', padding: '1rem' }}>
        {JSON.stringify({ 
          tiene_sesion: !!session,
          expires_at: session?.expires_at ?? null 
        }, null, 2)}
      </pre>
    </div>
  )
}
