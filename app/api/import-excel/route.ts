import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ISL_API_KEY = process.env.ISL_API_KEY || 'isl-2026-florencia-secreta';
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== ISL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Parse CSV/Excel as text (basic CSV support)
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    let imported = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      // Map common column names
      const nombre = row['nombre'] || row['name'] || row['first_name'] || '';
      const apellido = row['apellido'] || row['lastname'] || row['last_name'] || '';
      const art = row['art'] || row['aseguradora'] || 'Sin ART';
      const telefono = row['telefono'] || row['phone'] || row['tel'] || '';
      const siniestro_id = row['siniestro_id'] || row['siniestro'] || row['id'] || `SIN-2026-${Date.now()}-${i}`;

      if (!nombre && !apellido) continue;

      const { error } = await supabase.from('cases').insert({
        nombre,
        apellido,
        art,
        telefono,
        siniestro_id,
        estado: 'Pendiente',
        created_at: new Date().toISOString(),
      });

      if (error) errors.push(`Fila ${i}: ${error.message}`);
      else imported++;
    }

    // Register import
    await supabase.from('importaciones').insert({
      archivo: file.name,
      total: imported,
      errores: errors.length,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ imported, errors, total: lines.length - 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando el archivo' }, { status: 500 });
  }
}
