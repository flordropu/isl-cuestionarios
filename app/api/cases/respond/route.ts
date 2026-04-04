import { NextRequest, NextResponse } from 'next/server'
import { supabase, verifyApiKey } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { case_id, respuesta, canal = 'whatsapp' } = body

    if (!case_id || !respuesta) {
      return NextResponse.json(
        { error: 'Faltan campos: case_id, respuesta' },
        { status: 400 }
      )
    }

    const ahora = new Date().toISOString()

    const { data, error } = await supabase
      .from('cases')
      .update({
        estado: 'efectivo',
        respuesta_texto: respuesta,
        respondido_en: ahora,
        canal,
        updated_at: ahora
      })
      .eq('id', case_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error guardando respuesta:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
