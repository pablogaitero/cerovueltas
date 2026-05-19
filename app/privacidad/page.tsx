import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <Link href="/">
          <img src="/logo.png" alt="Cerovueltas" className="h-9 object-contain" />
        </Link>
        <Link href="/login" className="text-sm text-navy font-medium hover:underline">
          Iniciar sesión
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-navy mb-2">Política de Privacidad</h1>
        <p className="text-gray-400 text-sm mb-8">Última actualización: enero 2025</p>

        <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="font-display text-lg text-navy mb-3">1. Información que Recopilamos</h2>
            <p>Recopilamos información que usted nos proporciona directamente al registrarse, incluyendo nombre, apellido, email, empresa y RUT. También recopilamos información de uso de la plataforma de forma automática.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">2. Uso de la Información</h2>
            <p>Utilizamos su información para proveer y mejorar nuestros servicios, facilitar conexiones entre clientes y profesionales, enviar comunicaciones relacionadas con el servicio y cumplir con obligaciones legales.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">3. Compartición de Datos</h2>
            <p>No vendemos ni arrendamos su información personal a terceros. Compartimos información únicamente con los profesionales con quienes usted decide conectarse, y con proveedores de servicios necesarios para operar la plataforma.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">4. Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo cifrado de datos en tránsito y en reposo, y acceso restringido a datos personales.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">5. Sus Derechos</h2>
            <p>De acuerdo con la Ley 19.628 sobre Protección de la Vida Privada, usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales. Para ejercer estos derechos contáctenos en <a href="mailto:privacidad@cerovueltas.cl" className="text-gold hover:underline">privacidad@cerovueltas.cl</a></p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">6. Cookies</h2>
            <p>Utilizamos cookies esenciales para el funcionamiento de la plataforma, incluyendo cookies de sesión para mantener su estado de autenticación. No utilizamos cookies de seguimiento publicitario.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">7. Retención de Datos</h2>
            <p>Conservamos sus datos mientras mantenga una cuenta activa en la plataforma. Al eliminar su cuenta, sus datos personales serán eliminados en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">8. Contacto</h2>
            <p>Para consultas sobre privacidad, contáctenos en <a href="mailto:privacidad@cerovueltas.cl" className="text-gold hover:underline">privacidad@cerovueltas.cl</a></p>
          </section>

        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          © 2025 Cerovueltas — Antofagasta, Chile
        </p>
      </div>
    </div>
  )
}
