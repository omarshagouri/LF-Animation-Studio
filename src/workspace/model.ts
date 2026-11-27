export type Task = { id: string; title: string; due: string; source: string; done: boolean }
export type CaptureKind = 'meeting' | 'padel' | 'ampcorex' | 'task' | 'general'
export type Capture = { id: string; text: string; kind: CaptureKind; at: number }
export type Match = { id: string; partner: string; opponents: string; side: 'left' | 'right'; us: number; them: number; at: number }
export type ProductionStage = 'Idea' | 'Scored' | 'Scripted' | 'Recorded' | 'Visualized' | 'Ready' | 'Published' | 'Blocked'
export const stages: ProductionStage[] = ['Idea', 'Scored', 'Scripted', 'Recorded', 'Visualized', 'Ready', 'Published', 'Blocked']
export type ProductionItem = { id: string; title: string; format: 'LF' | 'SF'; stage: ProductionStage; next: string }
export type Notes = { summary: string; decisions: string[]; actions: string[] }
export type SavedMeeting = { id: string; title: string; at: number; durationMs: number; audioUri?: string; transcript: string; notes?: Notes }
export type WorkspaceData = { tasks: Task[]; captures: Capture[]; matches: Match[]; production: ProductionItem[]; meetings: SavedMeeting[] }
export const emptyWorkspace: WorkspaceData = { tasks: [], captures: [], matches: [], production: [], meetings: [] }
export const makeId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
export function classify(text: string): CaptureKind {
  if (/\b(padel|padelboard|matchi|partner|opponents)\b/i.test(text)) return 'padel'
  if (/\b(ampcorex|youtube|ax-lf|ax-sf|video pipeline)\b/i.test(text)) return 'ampcorex'
  if (/\b(meeting|minutes|transcript|agenda)\b/i.test(text)) return 'meeting'
  if (/\b(deadline|due|remind|appointment|invoice|follow up|todo|to-do)\b/i.test(text)) return 'task'
  return 'general'
}
export function matchStats(matches: Match[]) {
  const wins = matches.filter(m => m.us > m.them).length
  const losses = matches.filter(m => m.us < m.them).length
  const draws = matches.length - wins - losses
  return { wins, losses, draws, total: matches.length, points: wins * 25 - losses * 15 + draws * 5, winRate: matches.length ? Math.round(wins / matches.length * 100) : null }
}
export function partnerStats(matches: Match[]) {
  const groups = new Map<string, Match[]>()
  for (const m of matches) {
    const key = m.partner.trim().toLocaleLowerCase()
    groups.set(key, [...(groups.get(key) ?? []), m])
  }
  return [...groups.values()].map(group => ({ partner: group[0].partner, ...matchStats(group), left: matchStats(group.filter(m => m.side === 'left')), right: matchStats(group.filter(m => m.side === 'right')) })).sort((a,b) => b.total - a.total)
}
export function validScore(value: string) {
  return /^\d{1,3}$/.test(value.trim())
}
export function isDueDate(value: string) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === value
}
export function validNotes(value: unknown): value is Notes {
  if (!value || typeof value !== 'object') return false
  const n = value as Notes
  return typeof n.summary === 'string' && Array.isArray(n.decisions) && n.decisions.every(x => typeof x === 'string') && Array.isArray(n.actions) && n.actions.every(x => typeof x === 'string')
}
