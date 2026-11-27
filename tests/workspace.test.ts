import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addFollowUps, emptyWorkspace, mergeRecoveredMeetings, normalizeBackendUrl, parseWorkspace, classify, matchStats, partnerStats, validScore, isDueDate, validNotes, type Match } from '../src/workspace/model.ts'
const base: Match = { id:'a', partner:'Example', opponents:'Other team', side:'left', us:6, them:4, at:1 }
test('scoring is deterministic and no-data is not zero probability', () => {
  assert.deepEqual(matchStats([]), {wins:0, losses:0, draws:0,total:0,points:0,winRate:null})
  assert.deepEqual(matchStats([base,{...base,us:2},{...base,us:4}]), {wins:1,losses:1,draws:1,total:3,points:15,winRate:33})
})
test('partner grouping and sides', () => {
  const [p] = partnerStats([base,{...base,partner:' example ',side:'right',us:2}])
  assert.equal(p.total,2); assert.equal(p.left.wins,1); assert.equal(p.right.losses,1)
})
test('capture rules, dates, and scores', () => {
  assert.equal(classify('Padelboard result'),'padel')
  assert.equal(classify('deadline tomorrow'),'task')
  assert.equal(classify('normal message'),'general')
  assert.equal(validScore('6'),true); assert.equal(validScore('-1'),false)
  assert.equal(isDueDate('2026-02-30'),false); assert.equal(isDueDate('2026-02-28'),true)
  assert.equal(validNotes({summary:'S',decisions:[],actions:['A']}),true)
  assert.equal(validNotes({summary:'S',decisions:[],actions:[1]}),false)
})

test('storage rejects damaged data and merges recoverable recordings without overwriting edits', () => {
  assert.deepEqual(parseWorkspace(''), emptyWorkspace)
  assert.throws(() => parseWorkspace('{"meetings":[]}'), /Invalid workspace/)
  assert.throws(() => parseWorkspace(JSON.stringify({ ...emptyWorkspace, captures: [null] })), /Invalid workspace/)
  const saved = { id: 'a', title: 'Edited', at: 1, durationMs: 500, transcript: 'Review complete' }
  const recovered = { ...saved, title: 'Original', transcript: '' }
  assert.deepEqual(mergeRecoveredMeetings([saved], [recovered, { ...recovered, id: 'b', at: 2 }]), [
    { ...recovered, id: 'b', at: 2 }, saved,
  ])
})

test('cross-module handoffs deduplicate per source and retain completed tasks', () => {
  const data = addFollowUps(emptyWorkspace, 'Capture c1', ['  Review ', 'Review', ''])
  assert.equal(data.tasks.length, 1)
  assert.equal(data.tasks[0].title, 'Review')
  const completed = { ...data, tasks: [{ ...data.tasks[0], done: true }] }
  assert.equal(addFollowUps(completed, 'Capture c1', ['Review']), completed)
  assert.equal(addFollowUps(completed, 'Meeting m1', ['Review']).tasks.length, 2)
})

test('backend URLs use HTTPS and reject embedded credentials or query strings', () => {
  assert.equal(normalizeBackendUrl(' https://studio.example.test/service/ '), 'https://studio.example.test/service')
  for (const input of ['http://studio.example.test', 'https://user:pass@studio.example.test', 'https://studio.example.test/?token=x', 'https://studio.example.test/#private']) {
    assert.equal(normalizeBackendUrl(input), null)
  }
})
