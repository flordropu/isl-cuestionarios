import { NextRequest, NextResponse } from 'next/server'
import { supabase, verifyApiKey } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]

    const fechaInicio = `${fecha}T00:00:00.000Z`
    const fechaFin = `${fecha}T23:59:59.999Z`

    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin)
      .order('created_at', { ascending: true })

    if (error) throw error

    const resumen = {
      total: data.length,
      efectivos: data.filter(c => c.estado === 'efectivo').length,
      refuerzo1: data.filter(c => c.estado === 'refuerzo1').length,
      refuerzo2: data.filter(c => c.estado === 'refuerzo2').length,
      no_respondio: data.filter(c => c.estado === 'no_respondio').length,
      pendiente: data.filter(c => c.estado === 'pendiente').length,
    }

    return NextResponse.json({ success: true, fecha, ...resumen, cases: data })
  } catch (error: any) {
    console.error('Error generando reporte:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
