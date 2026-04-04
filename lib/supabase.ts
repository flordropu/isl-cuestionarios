import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Verificar API Key de ISL
export function verifyApiKey(request: Request): boolean {
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  const key = auth.replace('Bearer ', '').trim()
  return key === process.env.ISL_API_KEY
}
