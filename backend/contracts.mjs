function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function list(value, key) {
  if (!record(value)) throw new TypeError('Expected provider object')
  if (value[key] === undefined) return []
  if (!Array.isArray(value[key])) throw new TypeError('Expected provider list')
  return value[key]
}

// Decode the minimal fields the staging spike will need. These functions do not make requests.
export function gmailMessageIndex(value) {
  return list(value, 'messages').map(message => {
    if (!record(message) || typeof message.id !== 'string' || typeof message.threadId !== 'string') {
      throw new TypeError('Invalid Gmail message reference')
    }
    return { id: message.id, threadId: message.threadId }
  })
}

export function calendarEventIndex(value) {
  return list(value, 'items').filter(event => record(event) && event.status !== 'cancelled').map(event => {
    const start = event.start?.dateTime ?? event.start?.date
    const end = event.end?.dateTime ?? event.end?.date
    if (typeof event.id !== 'string' || typeof start !== 'string' || typeof end !== 'string') {
      throw new TypeError('Invalid Calendar event')
    }
    return { id: event.id, start, end }
  })
}

export function sheetGrid(value) {
  return list(value, 'values').map(row => {
    if (!Array.isArray(row) || !row.every(cell =>
      typeof cell === 'string' || typeof cell === 'boolean' || (typeof cell === 'number' && Number.isFinite(cell)))) {
      throw new TypeError('Invalid Sheets row')
    }
    return row
  })
}

export function youtubeReport(value) {
  const columns = list(value, 'columnHeaders').map(column => {
    if (!record(column) || typeof column.name !== 'string') throw new TypeError('Invalid YouTube column')
    return column.name
  })
  const rows = list(value, 'rows')
  if (!rows.every(row => Array.isArray(row) && row.length === columns.length)) throw new TypeError('Invalid YouTube row')
  return { columns, rows }
}

export function padelExtraction(value) {
  if (!record(value)) throw new TypeError('Invalid screenshot extraction')
  const { ourScore, theirScore, needsReview } = value
  const score = input => input === null || (Number.isInteger(input) && input >= 0 && input <= 999)
  if (!score(ourScore) || !score(theirScore) || typeof needsReview !== 'boolean') {
    throw new TypeError('Invalid screenshot scores')
  }
  return { ourScore, theirScore, needsReview: true }
}
