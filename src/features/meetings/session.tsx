import { createContext, useContext, useReducer, useRef, type PropsWithChildren } from 'react'
import { initialMeetingState, meetingReducer, type MeetingState } from './model'

type MeetingSession = MeetingState & { start: () => void; stop: () => void }
const MeetingContext = createContext<MeetingSession | null>(null)

export function MeetingProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(meetingReducer, initialMeetingState)
  const nextId = useRef(0)

  return (
    <MeetingContext.Provider value={{
      ...state,
      start: () => dispatch({ type: 'start', at: Date.now() }),
      stop: () => dispatch({ type: 'stop', at: Date.now(), id: String(nextId.current++) }),
    }}>
      {children}
    </MeetingContext.Provider>
  )
}

export function useMeetingSession() {
  const session = useContext(MeetingContext)
  if (!session) throw new Error('MeetingProvider is required')
  return session
}
