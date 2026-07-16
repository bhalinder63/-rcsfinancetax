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

export function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

// Open a private document via a short-lived signed URL.
export async function openDocument(doc) {
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 3600)
  if (error) throw error
  window.open(data.signedUrl, '_blank', 'noopener')
}

// Upload files for a request into the CLIENT's folder (so the client's
// storage read policy covers them) and record them in `documents`.
export async function uploadRequestDocuments({ files, clientId, requestId, uploadedBy }) {
  for (const file of files) {
    const path = `${clientId}/${requestId}/${Date.now()}_${sanitizeFileName(file.name)}`
    const { error: upErr } = await supabase.storage.from('documents').upload(path, file)
    if (upErr) throw upErr
    const { error: docErr } = await supabase
      .from('documents')
      .insert({ request_id: requestId, uploaded_by: uploadedBy, file_path: path, file_name: file.name })
    if (docErr) throw docErr
  }
}
