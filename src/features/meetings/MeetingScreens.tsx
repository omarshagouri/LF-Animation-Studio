import { useEffect, useRef, useState } from 'react'
import { Alert, Platform } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { StudioRoutes } from '../../app/routes'
import { Action, Card, Label, NavigationRow, Screen } from '../../ui/components'
import { ErrorText, Field } from '../../ui/Fields'
import { formatDuration, formatMeetingDate } from './model'
import { useMeetingSession } from './session'
import { useWorkspace } from '../../workspace/Workspace'
import { device } from '../../workspace/native'
import { analyze, sendNotes, transcribe } from '../../workspace/api'
import { makeId } from '../../workspace/model'

function Timer({ started }: { started: number | null }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (started === null) return
    const update = () => setElapsed(Math.max(0, Date.now() - started))
    update()
    const interval = setInterval(update, 250)
    return () => clearInterval(interval)
  }, [started])
  return <Label variant="timer">{formatDuration(started === null ? 0 : elapsed)}</Label>
}
export function MeetingsScreen({ navigation }: NativeStackScreenProps<StudioRoutes, 'Meetings'>) {
  const { startedAt, start, stop, audio, busy, error } = useMeetingSession()
  const { data, change, ready } = useWorkspace()
  const [title, setTitle] = useState('')
  const [consent, setConsent] = useState(false)
  const demo = Platform.OS === 'web'
  return <Screen>
    <Label variant="title">AI Meeting Assistant</Label>
    <Card>
      <Label variant="heading">{startedAt !== null ? 'Session active' : demo ? 'Browser recording demo' : 'Record a meeting'}</Label>
      <Timer started={startedAt} />
      <Label tone="muted">{demo ? 'Preview uses a timer only; no microphone or network access.' : 'Audio is stored locally. Background and interruption behavior requires device testing.'}</Label>
      <Field label="Meeting title (optional)" value={title} onChange={setTitle} />
      {!demo && <Action title={consent ? 'Consent confirmed · Change' : 'Confirm participants informed'} icon={consent ? 'checkmark-circle-outline' : 'shield-checkmark-outline'} onPress={() => setConsent(v => !v)} />}
      <Action title={busy ? 'Please wait…' : startedAt !== null ? 'Stop recording' : 'Start recording'} icon={startedAt !== null ? 'stop' : 'mic'} onPress={() => { if (startedAt !== null) { void stop().then(() => setConsent(false)) } else if (ready && (demo || consent)) { void start(title.trim()) } else { Alert.alert('Recording consent', 'Confirm participants have been informed and local storage is ready.') } }} />
      {audio === 'interrupted' && <Label tone="danger">Recording was interrupted. Stop to save the partial file.</Label>}
      <ErrorText message={error} />
    </Card>
    <Action title="Create meeting from text" icon="document-text-outline" onPress={() => { if (!ready) return; const id = makeId(); change(d => ({ ...d, meetings: [{ id, title: title.trim() || 'Meeting notes', at: Date.now(), durationMs: 0, transcript: '' }, ...d.meetings] })); navigation.navigate('MeetingDetails', { meetingId: id }) }} />
    <Label variant="heading">Meeting history</Label>
    {data.meetings.length === 0 && <Label tone="muted">No saved meetings.</Label>}
    {data.meetings.map(m => <NavigationRow key={m.id} title={m.title} subtitle={formatMeetingDate(m.at) + ' · ' + (m.notes ? 'Analyzed' : 'Awaiting analysis')} icon="document-text-outline" onPress={() => navigation.navigate('MeetingDetails', { meetingId: m.id })} />)}
  </Screen>
}
export function MeetingDetailsScreen({ route, navigation }: NativeStackScreenProps<StudioRoutes, 'MeetingDetails'>) {
  const { data, change, connection } = useWorkspace()
  const meeting = data.meetings.find(m => m.id === route.params.meetingId)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const locked = useRef(false)
  if (!meeting) return <Screen><Label>Meeting unavailable</Label></Screen>
  const id = meeting.id
  function patch(values: Partial<typeof meeting>) { change(d => ({ ...d, meetings: d.meetings.map(m => m.id === id ? { ...m, ...values } : m) })) }
  async function run(fn: () => Promise<void>) {
    if (locked.current) return
    locked.current = true; setBusy(true); setError(''); setMessage('')
    try { await fn() } catch(e) { setError(e instanceof Error ? e.message : 'Request failed') } finally { locked.current = false; setBusy(false) }
  }
  return <Screen>
    <Label variant="title">{meeting.title}</Label>
    <Card><Label>{formatMeetingDate(meeting.at)} · {formatDuration(meeting.durationMs)}</Label><Label tone="muted">{meeting.audioUri ? 'Local audio file available' : 'Text or demo session'}</Label>
      {meeting.audioUri && <Action title="Upload audio for transcription" icon="cloud-upload-outline" onPress={() => void run(async () => { if (!meeting.audioUri) return; const transcript = await transcribe(connection, meeting.audioUri); patch({ transcript, notes: undefined }); setMessage('Transcript received.') })} />}
      <Field label="Transcript or meeting notes" value={meeting.transcript} onChange={transcript => { if (!locked.current) patch({ transcript, notes: undefined }) }} multiline />
      <Action title={busy ? 'Processing…' : 'Generate AI notes (upload text)'} icon="sparkles-outline" onPress={() => void run(async () => { if (!meeting.transcript.trim()) throw new Error('Enter a transcript first.'); patch({ notes: await analyze(connection, meeting.transcript, 'meeting') }); setMessage('Analysis ready for review.') })} />
    </Card>
    {meeting.notes && <Card><Label variant="heading">Summary</Label><Label>{meeting.notes.summary}</Label><Label variant="heading">Decisions</Label>{meeting.notes.decisions.map((d,i) => <Label key={i}>{d}</Label>)}<Label variant="heading">Actions</Label>{meeting.notes.actions.map((a,i) => <Label key={i}>{a}</Label>)}<Action title="Add actions to Secretary" icon="checkmark-outline" onPress={() => { if (!meeting.notes) return; const tasks = meeting.notes.actions.map(title => ({ id: makeId(), title, source: 'Meeting ' + id, due: '', done: false })); change(d => ({ ...d, tasks: [...tasks.filter(t => !d.tasks.some(x => x.source === t.source && x.title === t.title)), ...d.tasks] })); setMessage('Actions added.') }} /><Action title="Send reviewed notes to configured email" icon="mail-outline" onPress={() => void run(async () => { if (!meeting.notes) return; await sendNotes(connection, meeting.title, meeting.notes); setMessage('Email sent by server.') })} /></Card>}
    <ErrorText message={error} /><Label tone="muted">{message}</Label>
    <Action title="Delete meeting and local audio" icon="trash-outline" onPress={() => void run(async () => { if (meeting.audioUri && device) await device.removeAudio(meeting.audioUri); change(d => ({ ...d, meetings: d.meetings.filter(m => m.id !== id) })); navigation.goBack() })} />
  </Screen>
}
