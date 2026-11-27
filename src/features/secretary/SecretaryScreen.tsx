import { useState } from 'react'
import { Action, Card, Label, Screen } from '../../ui/components'
import { Field, ErrorText } from '../../ui/Fields'
import { isDueDate, makeId } from '../../workspace/model'
import { useWorkspace } from '../../workspace/Workspace'
export function SecretaryScreen() {
  const { data, change, ready } = useWorkspace()
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [error, setError] = useState('')
  const open = data.tasks.filter(t => !t.done).sort((a,b) => (a.due || '9999').localeCompare(b.due || '9999'))
  const done = data.tasks.filter(t => t.done)
  const today = new Date().toLocaleDateString('sv-SE')
  function add() {
    if (!ready || !title.trim() || !isDueDate(due.trim())) { setError('Enter a task and an optional valid YYYY-MM-DD date.'); return }
    change(d => ({ ...d, tasks: [{ id: makeId(), title: title.trim(), due: due.trim(), source: 'Manual', done: false }, ...d.tasks] }))
    setTitle(''); setDue(''); setError('')
  }
  return <Screen><Label variant="title">Personal Secretary</Label><Label tone="muted">A single action inbox across your workspace. No email or calendar is accessed yet.</Label>
    <Card><Field label="New task" value={title} onChange={setTitle} /><Field label="Due date (YYYY-MM-DD, optional)" value={due} onChange={setDue} /><Action title="Add task" icon="add-outline" onPress={add} /><ErrorText message={error} /></Card>
    <Label variant="heading">Open · {open.length}</Label>
    {open.length === 0 && <Label tone="muted">No outstanding tasks.</Label>}
    {open.map(t => <Card key={t.id}><Label variant="heading">{t.title}</Label><Label tone={t.due && t.due < today ? 'danger' : 'muted'}>{t.due ? 'Due ' + t.due : 'No deadline'} · {t.source}</Label><Action title="Complete" icon="checkmark-outline" onPress={() => change(d => ({ ...d, tasks: d.tasks.map(x => x.id === t.id ? { ...x, done: true } : x) }))} /></Card>)}
    <Label variant="heading">Completed · {done.length}</Label>
    {done.map(t => <Card key={t.id}><Label>{t.title}</Label><Action variant="secondary" title="Reopen" icon="refresh-outline" onPress={() => change(d => ({ ...d, tasks: d.tasks.map(x => x.id === t.id ? { ...x, done: false } : x) }))} /><Action variant="danger" title="Delete" icon="trash-outline" onPress={() => change(d => ({ ...d, tasks: d.tasks.filter(x => x.id !== t.id) }))} /></Card>)}
  </Screen>
}
