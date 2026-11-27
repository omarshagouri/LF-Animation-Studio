import { useState } from 'react'
import { Action, Card, Label, Screen } from '../../ui/components'
import { Choice, ErrorText, Field } from '../../ui/Fields'
import { makeId, matchStats, partnerStats, validScore } from '../../workspace/model'
import { useWorkspace } from '../../workspace/Workspace'
export function PadelScreen() {
  const { data, ready, change } = useWorkspace()
  const [partner, setPartner] = useState('')
  const [opponents, setOpponents] = useState('')
  const [side, setSide] = useState<'left'|'right'>('left')
  const [us, setUs] = useState('')
  const [them, setThem] = useState('')
  const [error, setError] = useState('')
  const stats = matchStats(data.matches)
  function add() {
    if (!ready || !partner.trim() || !opponents.trim() || !validScore(us) || !validScore(them)) { setError('Enter partner, opponents and non-negative whole-number scores.'); return }
    const match = { id: makeId(), partner: partner.trim(), opponents: opponents.trim(), side, us: Number(us), them: Number(them), at: Date.now() }
    change(d => ({ ...d, matches: [match, ...d.matches] }))
    setUs(''); setThem(''); setError('')
  }
  return <Screen><Label variant="title">Padel Intelligence</Label>
    <Card><Label variant="heading">Performance</Label><Label variant="timer">{stats.winRate === null ? '—' : stats.winRate + '%'}</Label><Label tone="muted">Observed win rate · {stats.total} matches</Label><Label>{stats.wins} W / {stats.draws} D / {stats.losses} L · {stats.points >= 0 ? '+' : ''}{stats.points} points</Label><Label variant="caption" tone="muted">Points: win +25, loss −15, draw +5. This is not a predicted probability or official rating.</Label></Card>
    <Card><Label variant="heading">Log result</Label><Field label="Partner" value={partner} onChange={setPartner} /><Field label="Opponents" value={opponents} onChange={setOpponents} /><Choice label="Playing side" choices={['left','right']} value={side} onChange={v => setSide(v as 'left'|'right')} /><Field label="Our score" numeric value={us} onChange={setUs} /><Field label="Their score" numeric value={them} onChange={setThem} /><Action title="Save match" icon="add-outline" onPress={add} /><ErrorText message={error} /></Card>
    <Label variant="heading">Partner breakdown</Label>
    {partnerStats(data.matches).map(p => <Card key={p.partner}><Label variant="heading">{p.partner}</Label><Label>{p.wins}/{p.total} wins · {p.winRate}%</Label><Label tone="muted">Left: {p.left.wins}/{p.left.total} · Right: {p.right.wins}/{p.right.total}</Label></Card>)}
    <Label variant="heading">Match history</Label>
    {data.matches.map(m => <Card key={m.id}><Label variant="heading">{m.us}–{m.them} · {m.partner}</Label><Label tone="muted">{m.opponents} · {m.side}</Label><Action title="Remove result" icon="trash-outline" onPress={() => change(d => ({ ...d, matches: d.matches.filter(x => x.id !== m.id) }))} /></Card>)}
    <Label variant="caption" tone="muted">Screenshot extraction, Google Sheets synchronization and opponent-aware predictions are not connected.</Label>
  </Screen>
}
