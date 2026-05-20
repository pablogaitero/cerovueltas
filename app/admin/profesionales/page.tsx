import { createAdminClient } from '@/lib/supabase/admin'
import Topbar from '@/components/dashboard/Topbar'
import VerificarBtn from './VerificarBtn'
import { CheckCircle, XCircle } from 'lucide-react'
import { formatDate, ESPECIALIDAD_LABELS } from '@/lib/utils'

type ProfesionalAdmin = {
  id: string; titulo: string; badge: string | null
  especialidades: string[]; verificado: boolean
  disponible: boolean; rating: number; total_reviews: number
  created_at: string; anos_exp: number; user_id: string
}

type ProfileRow = {
  id: string; nombre: string; apellido: string | null
  email: string; rut: string | null; celular: string | null
  resumen: string | null; created_at: string
}

export default async function AdminProfesionalesPage({
  searchParams,
}: {
  searchParams: { filtro?: string }
}) {
  const supabase = createAdminClient()
  const filtro = searchParams.filtro ?? 'pendientes'

  let query = supabase
    .from('profesionales')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtro === 'pendientes') query = query.eq('verificado', false)
  if (filtro === 'verificados') query = query.eq('verificado', true)

  const { data: rawPros } = await query
  const profesionales = (rawPros ?? []) as unknown as ProfesionalAdmin[]

  // Obtener perfiles por separado
  const userIds = profesionales.map(p => p.user_id)
  const { data: rawProfiles } = userIds.length > 0
    ? await supabase.from('profiles').select('id, nombre, apellido, email, rut, celular, resumen, created_at').in('id', userIds)
    : { data: [] }
  const profiles = (rawProfiles ?? []) as unknown as ProfileRow[]

  const { count: totalPendientes } = await supabase
    .from('profesionales').select('*', { count: 'exact', head: true }).eq('verificado', false)
  const { count: totalVerificados } = await supabase
    .from('profesionales').select('*', { count: 'exact', head: true }).eq('verificado', true)

  return (
    <div>
      <Topbar title="Gestión de Profesionales" subtitle="Verifica y administra los perfiles profesionales" />
      <div className="p-8 space-y-6">

        <div className="flex gap-2">
          {[
            { value: 'pendientes',  label: `Por verificar (${totalPendientes ?? 0})` },
            { value: 'verificados', label: `Verificados (${totalVerificados ?? 0})` },
            { value: 'todos',       label: 'Todos' },
          ].map(f => (
            <a key={f.value} href={`?filtro=${f.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filtro === f.value
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              {f.label}
            </a>
          ))}
        </div>

        {!profesionales.length ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <CheckCircle size={36} className="text-green-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {filtro === 'pendientes' ? '¡Todos verificados!' : 'Sin profesionales en esta categoría.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profesionales.map(p => {
              const perfil = profiles.find(pr => pr.id === p.user_id)
              return (
                <div key={p.id} className={`bg-white rounded-xl border-2 overflow-hidden ${!p.verificado ? 'border-yellow-200' : 'border-gray-100'}`}>
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {perfil?.nombre?.[0] ?? '?'}{perfil?.apellido?.[0] ?? ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-navy text-base">
                            {perfil?.nombre ?? '—'} {perfil?.apellido ?? ''}
                          </h3>
                          {p.badge && (
                            <span className="bg-navy/8 text-navy text-xs font-bold px-2 py-0.5 rounded">{p.badge}</span>
                          )}
                          {p.verificado
                            ? <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-200">
                                <CheckCircle size={11} /> Verificado
                              </span>
                            : <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-yellow-200">
                                <XCircle size={11} /> Pendiente
                              </span>
                          }
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">{p.titulo}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.especialidades?.map(esp => (
                            <span key={esp} className="bg-gold/8 text-gold-dark border border-gold/20 text-xs px-2 py-0.5 rounded-full">
                              {ESPECIALIDAD_LABELS[esp] ?? esp}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <VerificarBtn profesionalId={p.id} verificadoActual={p.verificado} />
                        <p className="text-gray-400 text-xs">
                          Registrado {perfil ? formatDate(perfil.created_at) : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-0.5">Email</p>
                        <p className="text-gray-700 truncate">{perfil?.email ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-0.5">RUT</p>
                        <p className="text-gray-700">{perfil?.rut ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-0.5">Celular</p>
                        <p className="text-gray-700">{perfil?.celular ?? '—'}</p>
                      </div>
                    </div>

                    {perfil?.resumen && (
                      <div className="mt-3">
                        <p className="text-gray-400 text-xs font-medium mb-0.5">Resumen Ejecutivo</p>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{perfil.resumen}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
