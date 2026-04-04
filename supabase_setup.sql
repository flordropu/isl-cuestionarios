-- ============================================
-- ISL — Tablas de base de datos en Supabase
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================

-- Tabla principal de casos
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  celular TEXT,
  cliente TEXT NOT NULL,
  formulario TEXT DEFAULT 'Siniestro Vial',
  siniestro TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'refuerzo1', 'refuerzo2', 'efectivo', 'no_respondio')),
  plazo_horas INTEGER DEFAULT 24,
  fecha_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_vencimiento TIMESTAMPTZ,
  refuerzo1_en TIMESTAMPTZ,
  refuerzo2_en TIMESTAMPTZ,
  respondido_en TIMESTAMPTZ,
  cerrado_en TIMESTAMPTZ,
  respuesta_texto TEXT,
  canal TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial de importaciones
CREATE TABLE IF NOT EXISTS importaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  archivo TEXT,
  total_procesados INTEGER DEFAULT 0,
  con_errores INTEGER DEFAULT 0,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_cases_estado ON cases(estado);
CREATE INDEX IF NOT EXISTS idx_cases_celular ON cases(celular);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_fecha_vencimiento ON cases(fecha_vencimiento);

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE importaciones ENABLE ROW LEVEL SECURITY;

-- Politica: solo el service role puede acceder (desde la API)
CREATE POLICY "Service role full access cases"
  ON cases FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access importaciones"
  ON importaciones FOR ALL
  USING (true)
  WITH CHECK (true);
