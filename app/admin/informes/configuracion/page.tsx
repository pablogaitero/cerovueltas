import { createAdminClient } from '@/lib/supabase/admin'
import Topbar from '@/components/dashboard/Topbar'
import EditarPlanForm from './EditarPlanForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Valores por defecto si no existen en DB
const PLANES_DEFAULT = [
  {
    tipo: 'basico',
    label: 'Básico',
    precio: 49900,
    dias: '5-7',
    servicios: [
      'Balance general',
      'Estado de resultados',
      'Flujo de caja básico',
      'Entrega PDF',
    ],
  },
  {
    tipo: 'completo',
    label: 'Completo',
    precio: 129900,
    dias: '3-5',
    servicios: [
      'Todo lo del Básico',
      'Análisis de ratios',
      'Comparativo anual',
      'IFRS básico',
      'Reunión incluida',
    ],
  },
  {
    tipo: 'premium',
    label: 'Premium',
    precio: 249900,
    dias: '2-3',
    servicios: [
      'Todo lo del Completo',
      'Auditoría interna',
      'Due diligence',
      'Proyecciones 12 meses',
      'Soporte 30 días',
    ],
  },
]

export default async function ConfiguracionInformesPage() {
  const supabase = createAdminClient()

  // Cargar configuración guardada
  const { data: rawConfig } = await supabase
    .from('config_informes')
    .select('*')
    .order('tipo')

  // Si la tabla no existe aún, usar defaults
  const config = (rawConfig ?? []) as Array<{
    tipo: string; label: string; precio: number
    dias: string; servicios: string[]
  }>

  // Merge defaults con valores guardados
  const planes = PLANES_DEFAULT.map(def => {
    const guardado = config.find(c => c.tipo === def.tipo)
    return guardado ?? def
  })

  return (
    <div>
      <Topbar
        title="Configuración de Informes"
        subtitle="Edita los planes, precios y servicios de cada informe"
      />
      <div className="p-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-blue-700 text-sm">
          Los cambios se reflejarán inmediatamente en la página de informes para los clientes.
        </div>
        <div className="grid grid-cols-3 gap-6">
          {planes.map(plan => (
            <EditarPlanForm key={plan.tipo} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  )
}
