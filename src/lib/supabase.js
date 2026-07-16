import { createClient } from '@supabase/supabase-js'

// The publishable (anon) key is safe to ship in frontend code — access is
// governed entirely by Row-Level Security policies in supabase/setup.sql.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://xldseczulxcqraxnsiqy.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_tIQ6T_y89wn1oi1U87Hrmg_tFPEc1eb'

export const supabase = createClient(url, key)

export const STATUS_LABELS = {
  submitted: 'Submitted',
  in_process: 'In Process',
  completed: 'Completed',
}
