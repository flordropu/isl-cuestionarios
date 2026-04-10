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
    const body = await req.json();
    const rows: Record<string, string>[] = body.rows || [];
    const filename: string = body.filename || 'importacion';

    if (!rows.length) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    let imported = 0;
    const errors: string[] = [];
    const cases: Record<string, string>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Map column names flexibly
      const nombre = (row['nombre'] || row['Nombre'] || row['NOMBRE'] || '').toString().trim();
      const apellido = (row['apellido'] || row['Apellido'] || row['APELLIDO'] || '').toString().trim();
      const art = (row['art'] || row['ART'] || row['Art'] || row['aseguradora'] || 'Sin ART').toString().trim();
      const telefono = (row['telefono'] || row['Telefono'] || row['TELEFONO'] || row['phone'] || row['tel'] || '').toString().trim();
      const siniestro_id = (row['siniestro_id'] || row['Siniestro_id'] || row['siniestro'] || row['ID'] || `SIN-2026-${Date.now()}-${i}`).toString().trim();

      if (!nombre && !apellido) {
        errors.push(`Fila ${i + 1}: sin nombre ni apellido`);
        continue;
      }

      const caseData = {
        nombre,
        apellido,
        art,
        telefono,
        siniestro_id,
        estado: 'Pendiente',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('cases').insert(caseData);
      if (error) {
        errors.push(`Fila ${i + 1}: ${error.message}`);
      } else {
        imported++;
        cases.push(caseData);
      }
    }

    // Register import in importaciones table
    await supabase.from('importaciones').insert({
      archivo: filename,
      total: imported,
      errores: errors.length,
      created_at: new Date().toISOString(),
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ 
      imported, 
      errors, 
      total: rows.length,
      cases
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error procesando: ' + msg }, { status: 500 });
  }
}
