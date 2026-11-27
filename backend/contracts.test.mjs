import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gmailMessageIndex, calendarEventIndex, sheetGrid, youtubeReport, padelExtraction } from './contracts.mjs'

test('decodes provider envelopes without storing account content', () => {
  assert.deepEqual(gmailMessageIndex({ messages: [{ id: 'a', threadId: 'b' }], nextPageToken: 'test' }), [{ id: 'a', threadId: 'b' }])
  assert.throws(() => gmailMessageIndex({ messages: [{ id: 'a' }] }), /Gmail/)
  assert.deepEqual(calendarEventIndex({ items: [
    { id: 'c', status: 'cancelled' },
    { id: 'd', start: { date: '2026-11-27' }, end: { date: '2026-11-28' } },
  ] }), [{ id: 'd', start: '2026-11-27', end: '2026-11-28' }])
  assert.deepEqual(sheetGrid({ values: [['Header'], [6, true]] }), [['Header'], [6, true]])
  assert.throws(() => sheetGrid({ values: [[{}]] }), /Sheets/)
  assert.deepEqual(youtubeReport({ columnHeaders: [{ name: 'views' }], rows: [[1]] }), { columns: ['views'], rows: [[1]] })
  assert.throws(() => youtubeReport({ columnHeaders: [{ name: 'views' }], rows: [[1, 2]] }), /YouTube/)
})

test('screenshot scores preserve uncertainty and always require manual review', () => {
  assert.deepEqual(padelExtraction({ ourScore: 6, theirScore: null, needsReview: false }), {
    ourScore: 6, theirScore: null, needsReview: true,
  })
  assert.throws(() => padelExtraction({ ourScore: '6', theirScore: -1, needsReview: false }), /Invalid screenshot/)
})
