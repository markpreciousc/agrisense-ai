import { supabase } from './supabase'
import { getUnsynced, markSynced } from './history'

let syncing = false   // stops two syncs running at the same time

export async function syncPending() {
  if (syncing || !navigator.onLine) return
  syncing = true
  try {
    const pending = await getUnsynced()
    for (const r of pending) {
      const { error } = await supabase.from('diagnoses').insert({
        id: r.id,
        device_id: r.deviceId,
        created_at: r.createdAt,
        crop: r.crop,
        disease: r.disease,
        is_healthy: r.isHealthy,
        confidence: r.confidence,
        severity: r.severity,
        selected_crop: r.selectedCrop,
        uncertain: r.uncertain,
      })
      // 23505 = duplicate id: the row already reached the server earlier
      if (!error || error.code === '23505') await markSynced(r.id)
      else break   // network or server trouble: stop and retry later
    }
  } finally {
    syncing = false
  }
}