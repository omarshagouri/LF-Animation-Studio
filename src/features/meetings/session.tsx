import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { Platform } from 'react-native'
import { device } from '../../workspace/native'
import { useWorkspace } from '../../workspace/Workspace'
import { makeId } from '../../workspace/model'
type Session = { startedAt: number | null; audio: 'idle' | 'recording' | 'interrupted'; busy: boolean; error: string; start: (title: string) => Promise<void>; stop: () => Promise<void> }
const Context = createContext<Session | null>(null)
export function MeetingProvider({ children }: PropsWithChildren) {
  const { change } = useWorkspace()
  const [startedAt, setStarted] = useState<number | null>(null)
  const [audio, setAudio] = useState<Session['audio']>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const active = useRef<{ at: number; title: string } | null>(null)
  const lock = useRef(false)
  useEffect(() => {
    if (startedAt === null || !device) return
    const interval = setInterval(() => { if (!device.recording()) setAudio('interrupted') }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])
  async function start(title: string) {
    if (lock.current || active.current) return
    lock.current = true; setBusy(true); setError('')
    try {
      if (Platform.OS === 'ios') {
        if (!device) throw new Error('Native microphone module not available in this build.')
        if (!await device.permission()) throw new Error('Microphone permission denied.')
        await device.start()
      }
      const at = Date.now()
      active.current = { at, title }; setStarted(at); setAudio('recording')
    } catch(e) { setError(e instanceof Error ? e.message : 'Recording could not start') } finally { lock.current = false; setBusy(false) }
  }
  async function stop() {
    const session = active.current
    if (lock.current || !session) return
    lock.current = true; setBusy(true); setError('')
    try {
      const uri = device ? await device.stop() : undefined
      const entry = { id: makeId(), title: session.title || 'Meeting ' + new Date(session.at).toLocaleDateString(), at: session.at, durationMs: Math.max(0, Date.now()-session.at), audioUri: uri, transcript: '' }
      change(d => ({ ...d, meetings: [entry, ...d.meetings] }))
      active.current = null; setStarted(null); setAudio('idle')
    } catch(e) { setError(e instanceof Error ? e.message : 'Recording could not be saved') } finally { lock.current = false; setBusy(false) }
  }
  return <Context.Provider value={{ startedAt, audio, busy, error, start, stop }}>{children}</Context.Provider>
}
export function useMeetingSession() { const value = useContext(Context); if (!value) throw new Error('MeetingProvider required'); return value }
