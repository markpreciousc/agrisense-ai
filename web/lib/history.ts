import { get, set, entries } from 'idb-keyval'

const PREFIX = 'dx:'

export interface DiagnosisRecord {
  id: string
  deviceId: string
  createdAt: string
  crop: string
  disease: string
  isHealthy: boolean
  confidence: number
  severity: number | null
  selectedCrop: string | null
  uncertain: boolean
  synced: boolean
}

export function getDeviceId(): string {
  let id = localStorage.getItem('agrisense-device-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('agrisense-device-id', id)
  }
  return id
}

export async function saveDiagnosis(
  input: Omit<DiagnosisRecord, 'id' | 'deviceId' | 'createdAt' | 'synced'>
) {
  const record: DiagnosisRecord = {
    ...input,
    id: crypto.randomUUID(),
    deviceId: getDeviceId(),
    createdAt: new Date().toISOString(),
    synced: false,
  }
  await set(PREFIX + record.id, record)
  return record
}

export async function getUnsynced(): Promise<DiagnosisRecord[]> {
  const all = await entries()
  return all
    .filter(([key]) => typeof key === 'string' && key.startsWith(PREFIX))
    .map(([, value]) => value as DiagnosisRecord)
    .filter((r) => !r.synced)
}

export async function markSynced(id: string) {
  const record = await get<DiagnosisRecord>(PREFIX + id)
  if (record) await set(PREFIX + id, { ...record, synced: true })
}