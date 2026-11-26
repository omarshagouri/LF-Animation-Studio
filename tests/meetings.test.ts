/// <reference types="node" />

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDuration, initialMeetingState, meetingReducer } from '../src/features/meetings/model.ts'

test('stopping a session adds its details to the history', () => {
  const started = meetingReducer(initialMeetingState, { type: 'start', at: 0 })
  const stopped = meetingReducer(started, { type: 'stop', at: 2300, id: 'first' })
  assert.deepEqual(stopped, {
    startedAt: null,
    history: [{ id: 'first', title: 'Meeting 1', startedAt: 0, durationMs: 2300, status: 'pending' }],
  })

  const next = meetingReducer(stopped, { type: 'start', at: 4000 })
  const finished = meetingReducer(next, { type: 'stop', at: 4500, id: 'second' })
  assert.deepEqual(finished.history.map(meeting => meeting.id), ['second', 'first'])
})

test('duplicate starts and stops leave the current session intact', () => {
  const stop = { type: 'stop', at: 2500, id: 'first' } as const
  assert.equal(meetingReducer(initialMeetingState, stop), initialMeetingState)
  const started = meetingReducer(initialMeetingState, { type: 'start', at: 1000 })
  assert.equal(meetingReducer(started, { type: 'start', at: 2000 }), started)
  const finished = meetingReducer(started, stop)
  assert.equal(meetingReducer(finished, stop), finished)
})

test('formats duration across hour boundaries and clamps negative times', () => {
  assert.equal(formatDuration(-100), '00:00:00')
  assert.equal(formatDuration(59_999), '00:00:59')
  assert.equal(formatDuration(3_661_000), '01:01:01')
})
