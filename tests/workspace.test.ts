import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classify, matchStats, partnerStats, validScore, isDueDate, validNotes, type Match } from '../src/workspace/model.ts'
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
