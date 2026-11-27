import { useRef, useState } from 'react'
import { Platform } from 'react-native'
import { Action, Card, Label, Screen } from '../../ui/components'
import { Choice, ErrorText, Field } from '../../ui/Fields'
import { addFollowUps, classify, makeId, type CaptureKind, type Notes } from '../../workspace/model'
import { useWorkspace } from '../../workspace/Workspace'
import { analyze } from '../../workspace/api'
const kinds: CaptureKind[] = ['general','task','meeting','padel','ampcorex']
export function CaptureScreen() {
  const { data, change, ready, connection } = useWorkspace()
  const [text, setText] = useState('')
  const [kind, setKind] = useState<CaptureKind>('general')
  const [notes, setNotes] = useState<Notes>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const request = useRef(0)
  function save() {
    if (busy) return
    if (!ready || !text.trim()) { setError('Enter content after the workspace loads.'); return }
    const capture = { id: makeId(), text: text.trim(), kind, at: Date.now() }
    change(d => ({ ...d, captures: [capture, ...d.captures] }))
    setText(''); setNotes(undefined); setError('')
  }
  async function run() {
    if (busy || !text.trim()) return
    const id = ++request.current
    setBusy(true); setError(''); setNotes(undefined)
    try { const result = await analyze(connection, text.trim(), kind); if (request.current === id) setNotes(result) } catch (e) { if (request.current === id) setError(e instanceof Error ? e.message : 'Analysis failed') } finally { setBusy(false) }
  }
  return <Screen>
    <Label variant="title">Universal Capture</Label>
    <Label tone="muted">Paste text, a link or a copied message. Suggested categories use local keyword rules until AI is connected.</Label>
    <Card>
      <Field label="Content" value={text} onChange={v => { request.current++; setText(v); setKind(classify(v)); setNotes(undefined) }} multiline />
      <Choice label="Category" choices={kinds} value={kind} onChange={v => { request.current++; setKind(v); setNotes(undefined) }} />
      <Action disabled={busy} title="Save to inbox" icon="archive-outline" onPress={save} />
      {Platform.OS === 'ios' && <Action disabled={busy} variant="secondary" title={busy ? 'Analyzing…' : 'Analyze with AI (upload text)'} icon="sparkles-outline" onPress={() => void run()} />}
      <ErrorText message={error} />
      {notes && <><Label variant="heading">{notes.summary}</Label>{notes.actions.map((a,i) => <Label key={i}>{a}</Label>)}<Action title="Add suggested actions to Secretary" icon="checkmark-outline" onPress={() => { change(d => addFollowUps(d, 'Capture analysis', notes.actions)); setNotes(undefined) }} /></>}
    </Card>
    <Label variant="heading">Capture inbox</Label>
    {data.captures.length === 0 && <Label tone="muted">No saved captures.</Label>}
    {data.captures.map(c => <Card key={c.id}><Label variant="caption" tone="accent">{c.kind.toUpperCase()} · {new Date(c.at).toLocaleDateString()}</Label><Label>{c.text}</Label><Action title="Create follow-up task" icon="add-outline" onPress={() => change(d => addFollowUps(d, 'Capture ' + c.id, [c.text.slice(0, 240)]))} /><Action variant="danger" title="Delete capture" icon="trash-outline" onPress={() => change(d => ({ ...d, captures: d.captures.filter(x => x.id !== c.id) }))} /></Card>)}
    <Label variant="caption" tone="muted">iOS Share Sheet intake, photo import and OCR are separate native milestones.</Label>
  </Screen>
}
