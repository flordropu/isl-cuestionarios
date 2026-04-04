import { NextRequest, NextResponse } from 'next/server'
import { supabase, verifyApiKey } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado_in = searchParams.get('estado_in') || 'pendiente,refuerzo1,refuerzo2'
    const estados = estado_in.split(',')

    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .in('estado', estados)
      .order('fecha_envio', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, cases: data, total: data.length })
  } catch (error: any) {
    console.error('Error obteniendo casos activos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
