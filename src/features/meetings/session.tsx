import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { AppState, Platform } from 'react-native'
import { device } from '../../workspace/native'
import { useWorkspace } from '../../workspace/Workspace'
import { makeId, mergeRecoveredMeetings } from '../../workspace/model'

type AudioState = 'idle' | 'recording' | 'interrupted'
type Session = {
  startedAt: number | null
  audio: AudioState
  busy: boolean
  error: string
  start: (title: string) => Promise<void>
  stop: () => Promise<void>
}
const Context = createContext<Session | null>(null)

export function MeetingProvider({ children }: PropsWithChildren) {
  const { change } = useWorkspace()
  const [startedAt, setStarted] = useState<number | null>(null)
  const [audio, setAudio] = useState<AudioState>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const active = useRef<{ at: number; elapsedFrom: number; title: string } | null>(null)
  const lock = useRef(false)

  useEffect(() => {
    const recorder = device
    const session = active.current
    if (!session || startedAt === null || !recorder) return
    async function check() {
      try {
        if (!await recorder?.recording() && active.current === session && !lock.current) setAudio('interrupted')
      } catch {
        if (active.current === session) setError('Could not read microphone status.')
      }
    }
    const interval = setInterval(() => { void check() }, 1000)
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') void check()
    })
    return () => { clearInterval(interval); subscription.remove() }
  }, [startedAt])

  async function start(title: string) {
    if (lock.current || active.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const label = title || 'Meeting ' + new Date().toLocaleDateString()
      if (Platform.OS === 'ios') {
        if (!device) throw new Error('Native microphone module not available in this build.')
        if (!await device.permission()) throw new Error('Microphone permission denied.')
        await device.start(label)
      }
      const elapsedFrom = performance.now()
      active.current = { at: Date.now(), elapsedFrom, title: label }
      setStarted(elapsedFrom)
      setAudio('recording')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recording could not start')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function stop() {
    const session = active.current
    if (lock.current || !session) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const entry = device ? await device.stop() : {
        id: makeId(), title: session.title, at: session.at,
        durationMs: Math.max(0, performance.now() - session.elapsedFrom), transcript: '',
      }
      change(data => ({ ...data, meetings: mergeRecoveredMeetings(data.meetings, [entry]) }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recording could not be saved')
    } finally {
      active.current = null
      setStarted(null)
      setAudio('idle')
      lock.current = false
      setBusy(false)
    }
  }
  return <Context.Provider value={{ startedAt, audio, busy, error, start, stop }}>{children}</Context.Provider>
}

export function useMeetingSession() {
  const value = useContext(Context)
  if (!value) throw new Error('MeetingProvider required')
  return value
}
