import Link from 'next/link'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav simple */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <Link href="/">
          <img src="/logo.png" alt="Cerovueltas" className="h-9 object-contain" />
        </Link>
        <Link href="/login" className="text-sm text-navy font-medium hover:underline">
          Iniciar sesión
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-navy mb-2">Términos de Uso</h1>
        <p className="text-gray-400 text-sm mb-8">Última actualización: enero 2025</p>

        <div className="bg-white rounded-xl border border-gray-100 p-8 space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="font-display text-lg text-navy mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar la plataforma Cerovueltas, usted acepta estar sujeto a estos Términos de Uso. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">2. Descripción del Servicio</h2>
            <p>Cerovueltas es una plataforma digital que conecta a pequeñas y medianas empresas (PYMEs) con profesionales verificados en las áreas de contabilidad, asesoría tributaria y derecho, en la región de Antofagasta, Chile.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">3. Registro y Cuentas</h2>
            <p>Para utilizar nuestros servicios debe crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">4. Tarifas y Pagos</h2>
            <p>La conexión con un profesional tiene un costo único de $29.000 CLP. Los informes financieros tienen tarifas según el tipo seleccionado. Todos los precios incluyen IVA. Los pagos se procesan de forma segura a través de nuestra plataforma de pagos.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">5. Verificación de Profesionales</h2>
            <p>Cerovueltas verifica las credenciales de los profesionales registrados, sin embargo no garantiza los resultados de los servicios prestados. La relación contractual se establece directamente entre el cliente y el profesional.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">6. Limitación de Responsabilidad</h2>
            <p>Cerovueltas actúa como intermediario y no es responsable por la calidad de los servicios profesionales prestados. En ningún caso nuestra responsabilidad excederá el monto pagado por el servicio de conexión.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">7. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor al ser publicadas en la plataforma. El uso continuado del servicio implica la aceptación de los nuevos términos.</p>
          </section>

          <section>
            <h2 className="font-display text-lg text-navy mb-3">8. Contacto</h2>
            <p>Para consultas sobre estos términos, contáctenos en <a href="mailto:contacto@cerovueltas.cl" className="text-gold hover:underline">contacto@cerovueltas.cl</a></p>
          </section>

        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          © 2025 Cerovueltas — Antofagasta, Chile
        </p>
      </div>
    </div>
  )
}
