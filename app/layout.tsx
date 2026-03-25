import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cerovueltas — Conectando PyMEs con Profesionales',
  description:
    'Plataforma que conecta PYMEs de Antofagasta con contadores, asesores tributarios y abogados verificados.',
  keywords: ['contador', 'abogado', 'PYME', 'Antofagasta', 'tributario', 'IFRS'],
  openGraph: {
    title: 'Cerovueltas',
    description: 'Conectando PyMEs con contadores y abogados verificados en Antofagasta.',
    locale: 'es_CL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
