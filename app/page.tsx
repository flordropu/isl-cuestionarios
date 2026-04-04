export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#3db87a' }}>ISL — Sistema de Gestión de Cuestionarios</h1>
      <p style={{ color: '#666', marginTop: '12px' }}>API funcionando correctamente.</p>
      <div style={{ marginTop: '24px', background: '#eaf3de', padding: '16px', borderRadius: '8px' }}>
        <h3 style={{ color: '#1a5c3a', marginBottom: '12px' }}>Endpoints disponibles</h3>
        <ul style={{ color: '#333', lineHeight: '2' }}>
          <li>POST /api/cases/create</li>
          <li>GET /api/cases/active</li>
          <li>PATCH /api/cases/update</li>
          <li>GET /api/cases/find</li>
          <li>POST /api/cases/respond</li>
          <li>GET /api/reports/daily</li>
        </ul>
      </div>
    </main>
  )
}
