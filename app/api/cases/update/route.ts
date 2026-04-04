import { NextRequest, NextResponse } from 'next/server'
import { supabase, verifyApiKey } from '@/lib/supabase'

export async function PATCH(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, estado, ...rest } = body

    if (!id || !estado) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: id, estado' },
        { status: 400 }
      )
    }

    const estadosValidos = ['pendiente', 'refuerzo1', 'refuerzo2', 'efectivo', 'no_respondio']
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: 'Estado invalido' }, { status: 400 })
    }

    const updateData: any = { estado, updated_at: new Date().toISOString(), ...rest }

    // Fecha de vencimiento segun el nuevo estado
    if (estado === 'refuerzo1') {
      updateData.fecha_vencimiento = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } else if (estado === 'refuerzo2') {
      updateData.fecha_vencimiento = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error actualizando caso:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
