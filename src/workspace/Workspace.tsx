import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { Platform } from 'react-native'
import { emptyWorkspace, type WorkspaceData } from './model'
import { device } from './native'

type Connection = { url: string; token: string }
type Workspace = { data: WorkspaceData; ready: boolean; storageError: string; change: (fn: (prev: WorkspaceData) => WorkspaceData) => void; connection: Connection; connect: (c: Connection) => void }
const Context = createContext<Workspace | null>(null)

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<WorkspaceData>(emptyWorkspace)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [connection, connect] = useState<Connection>({ url: '', token: '' })
  const writes = useRef(Promise.resolve())
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const raw = device ? await device.readWorkspace() : ''
        if (active && raw) {
          const parsed = JSON.parse(raw) as Partial<WorkspaceData>
          if (Object.keys(emptyWorkspace).some(key => !Array.isArray(parsed[key as keyof WorkspaceData]))) throw new Error('Invalid workspace')
          setData({ ...emptyWorkspace, ...parsed })
        }
        if (active && Platform.OS === 'ios' && !device) setStorageError('Native storage unavailable; session only.')
        if (active) setReady(true)
      } catch {
        if (active) setStorageError('Could not load local data. Reopen the app before editing; existing files were not overwritten.')
      }
    }
    void load()
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!ready || !device) return
    const snapshot = JSON.stringify(data)
    writes.current = writes.current.catch(() => {}).then(() => device.writeWorkspace(snapshot)).catch(() => setStorageError('Saving failed. Keep the app open and retry an edit.'))
  }, [data, ready])
  return <Context.Provider value={{ data, ready, storageError, change: fn => { if (ready) setData(fn) }, connection, connect }}>{children}</Context.Provider>
}
export function useWorkspace() {
  const value = useContext(Context)
  if (!value) throw new Error('WorkspaceProvider required')
  return value
}
