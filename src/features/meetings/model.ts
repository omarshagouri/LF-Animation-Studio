export type Meeting = {
  id: string
  title: string
  startedAt: number
  durationMs: number
  status: 'pending' | 'processed'
}

export type MeetingState = { startedAt: number | null; history: Meeting[] }
export type MeetingAction = { type: 'start'; at: number } | { type: 'stop'; at: number; id: string }

export const initialMeetingState: MeetingState = { startedAt: null, history: [] }

export function meetingReducer(state: MeetingState, action: MeetingAction): MeetingState {
  if (action.type === 'start') {
    return state.startedAt === null ? { ...state, startedAt: action.at } : state
  }
  if (state.startedAt === null) return state

  const meeting: Meeting = {
    id: action.id,
    title: `Meeting ${state.history.length + 1}`,
    startedAt: state.startedAt,
    durationMs: Math.max(0, action.at - state.startedAt),
    status: 'pending',
  }

  return { startedAt: null, history: [meeting, ...state.history] }
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000)
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':')
}

export const meetingStatus: Record<Meeting['status'], string> = {
  pending: 'Awaiting processing',
  processed: 'Processed',
}

export function formatMeetingDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
