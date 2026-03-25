import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function getInitials(nombre: string, apellido?: string | null): string {
  const first = nombre?.[0]?.toUpperCase() ?? ''
  const last = apellido?.[0]?.toUpperCase() ?? ''
  return first + last || nombre?.slice(0, 2).toUpperCase() ?? 'CV'
}

export const ESPECIALIDAD_LABELS: Record<string, string> = {
  contador:          'Contador',
  asesor_tributario: 'Asesor Tributario',
  abogado:           'Abogado',
  auditor:           'Auditor',
  ifrs:              'Especialista IFRS',
}

export const PRECIO_INFORME: Record<string, number> = {
  basico:   49900,
  completo: 129900,
  premium:  249900,
}
