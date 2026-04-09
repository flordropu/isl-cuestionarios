import { NextRequest, NextResponse } from 'next/server';

const ISL_API_KEY = process.env.ISL_API_KEY || 'isl-2026-florencia-secreta';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== ISL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Sos el asistente del sistema ISL de Medicina Empresarial para gestionar cuestionarios a trabajadores siniestrados de ART en Argentina. El sistema importa Excel diario, envia cuestionarios por WhatsApp y hace seguimiento con estados: Pendiente, Refuerzo 1 (24hs), Refuerzo 2 (48hs), No respondio (72hs) o Efectivo. Responde en espanol rioplatense, breve y practico.',
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'No pude procesar tu consulta.';
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
