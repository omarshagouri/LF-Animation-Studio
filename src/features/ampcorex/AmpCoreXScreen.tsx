import { useState } from 'react'
import { Action, Card, Label, Screen } from '../../ui/components'
import { Choice, ErrorText, Field } from '../../ui/Fields'
import { makeId, stages, type ProductionStage } from '../../workspace/model'
import { useWorkspace } from '../../workspace/Workspace'
export function AmpCoreXScreen() {
  const { data, change, ready } = useWorkspace()
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState<'LF'|'SF'>('LF')
  const [stage, setStage] = useState<ProductionStage>('Idea')
  const [next, setNext] = useState('')
  const [error, setError] = useState('')
  function add() {
    if (!ready || !title.trim()) { setError('Enter a production item title.'); return }
    change(d => ({ ...d, production: [{ id: makeId(), title: title.trim(), format, stage, next: next.trim() }, ...d.production] }))
    setTitle(''); setNext(''); setError('')
  }
  return <Screen><Label variant="title">AmpCoreX</Label><Label tone="muted">Local production planning · no live pipeline or Make scenario is modified.</Label>
    <Card><Label variant="heading">Production overview</Label><Label>{data.production.filter(p => p.format === 'LF').length} long-form · {data.production.filter(p => p.format === 'SF').length} short-form</Label>{stages.map(s => <Label key={s} tone="muted">{s} · {data.production.filter(p => p.stage === s).length}</Label>)}</Card>
    <Card><Label variant="heading">Add production item</Label><Field label="Title or video ID" value={title} onChange={setTitle} /><Choice label="Format" choices={['LF','SF']} value={format} onChange={v => setFormat(v as 'LF'|'SF')} /><Choice label="Stage" choices={stages} value={stage} onChange={v => setStage(v as ProductionStage)} /><Field label="Next action" value={next} onChange={setNext} /><Action title="Add item" icon="add-outline" onPress={add} /><ErrorText message={error} /></Card>
    {data.production.map(p => <Card key={p.id}><Label variant="caption" tone="accent">{p.format} · {p.stage}</Label><Label variant="heading">{p.title}</Label><Choice label="Local stage" choices={stages} value={p.stage} onChange={v => change(d => ({ ...d, production: d.production.map(x => x.id === p.id ? { ...x, stage: v as ProductionStage } : x) }))} />{p.next ? <><Label>{p.next}</Label><Action title="Add action to Secretary" icon="checkmark-outline" onPress={() => change(d => ({ ...d, tasks: [{ id: makeId(), title: p.next, due: '', source: 'AmpCoreX ' + p.title, done: false }, ...d.tasks] }))} /></> : null}<Action title="Remove local item" icon="trash-outline" onPress={() => change(d => ({ ...d, production: d.production.filter(x => x.id !== p.id) }))} /></Card>)}
  </Screen>
}
