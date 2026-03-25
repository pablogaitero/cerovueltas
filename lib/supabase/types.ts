export type UserRole = 'cliente' | 'profesional' | 'admin'
export type Especialidad = 'contador' | 'asesor_tributario' | 'abogado' | 'auditor' | 'ifrs'
export type EstadoConexion = 'pendiente' | 'pagada' | 'activa' | 'cerrada'
export type TipoInforme = 'basico' | 'completo' | 'premium'
export type EstadoInforme = 'solicitado' | 'en_proceso' | 'entregado' | 'cancelado'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          nombre: string
          apellido: string | null
          email: string
          telefono: string | null
          empresa: string | null
          rut: string | null
          avatar_url: string | null
          ciudad: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          nombre: string
          apellido?: string | null
          email: string
          telefono?: string | null
          empresa?: string | null
          rut?: string | null
          avatar_url?: string | null
          ciudad?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      profesionales: {
        Row: {
          id: string
          user_id: string
          titulo: string
          especialidades: Especialidad[]
          bio: string | null
          anos_exp: number
          tarifa_hora: number | null
          badge: string | null
          rating: number
          total_reviews: number
          disponible: boolean
          verificado: boolean
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profesionales']['Row'], 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'>
        Update: Partial<Database['public']['Tables']['profesionales']['Insert']>
      }
      conexiones: {
        Row: {
          id: string
          cliente_id: string
          profesional_id: string
          estado: EstadoConexion
          monto: number
          orden_pago: string | null
          pagado_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conexiones']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conexiones']['Insert']>
      }
      mensajes: {
        Row: {
          id: string
          conexion_id: string
          emisor_id: string
          contenido: string
          leido: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mensajes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mensajes']['Insert']>
      }
      informes: {
        Row: {
          id: string
          cliente_id: string
          profesional_id: string | null
          tipo: TipoInforme
          estado: EstadoInforme
          titulo: string | null
          descripcion: string | null
          precio: number
          archivo_url: string | null
          orden_pago: string | null
          pagado_at: string | null
          entregado_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['informes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['informes']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          conexion_id: string
          cliente_id: string
          profesional_id: string
          rating: number
          comentario: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
    }
  }
}

// Tipos derivados útiles
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Profesional = Database['public']['Tables']['profesionales']['Row']
export type Conexion = Database['public']['Tables']['conexiones']['Row']
export type Mensaje = Database['public']['Tables']['mensajes']['Row']
export type Informe = Database['public']['Tables']['informes']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

// Profesional con perfil unido (para listados)
export type ProfesionalConPerfil = Profesional & {
  profiles: Pick<Profile, 'nombre' | 'apellido' | 'avatar_url' | 'email'>
}
