import { NextRequest, NextResponse } from 'next/server'
import { supabase, verifyApiKey } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const celular = searchParams.get('celular')
    const estado_not = searchParams.get('estado_not') || 'efectivo,no_respondio'

    if (!celular) {
      return NextResponse.json({ error: 'Falta el parametro celular' }, { status: 400 })
    }

    const estadosExcluidos = estado_not.split(',')

    // Normalizar numero — quitar espacios y guiones
    const celularNorm = celular.replace(/[\s\-]/g, '')

    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .ilike('celular', `%${celularNorm.slice(-8)}%`)
      .not('estado', 'in', `(${estadosExcluidos.map(e => `"${e}"`).join(',')})`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({ found: false, data: null })
    }

    return NextResponse.json({ found: true, id: data[0].id, data: data[0] })
  } catch (error: any) {
    console.error('Error buscando caso:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
