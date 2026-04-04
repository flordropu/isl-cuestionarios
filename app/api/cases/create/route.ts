import { NextRequest, NextResponse } from 'next/server'
import { supabase, verifyApiKey } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      nombre, apellido, dni, celular, cliente,
      formulario, siniestro, plazo_horas = 24
    } = body

    if (!nombre || !apellido || !cliente) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: nombre, apellido, cliente' },
        { status: 400 }
      )
    }

    const fecha_envio = new Date().toISOString()
    const fecha_vencimiento = new Date(
      Date.now() + plazo_horas * 60 * 60 * 1000
    ).toISOString()

    const { data, error } = await supabase
      .from('cases')
      .insert({
        nombre,
        apellido,
        dni: dni || null,
        celular: celular || null,
        cliente,
        formulario: formulario || 'Siniestro Vial',
        siniestro: siniestro || null,
        estado: 'pendiente',
        plazo_horas,
        fecha_envio,
        fecha_vencimiento,
        created_at: fecha_envio
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, id: data.id, data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creando caso:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
