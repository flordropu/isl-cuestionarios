export const metadata = {
  title: 'ISL — Sistema de Gestión de Cuestionarios',
  description: 'API para gestión de cuestionarios a trabajadores siniestrados',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
