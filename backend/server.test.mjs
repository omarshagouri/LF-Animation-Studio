import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStudioServer } from './server.mjs'
test('private API rejects unauthorized requests and malformed input', async () => {
  const token = 'test-token-not-a-production-secret-1234'
  const server = createStudioServer({STUDIO_ACCESS_TOKEN:token})
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
  const url = 'http://127.0.0.1:' + server.address().port
  try {
    assert.equal((await fetch(url+'/health')).status,200)
    assert.equal((await fetch(url+'/v1/analyze',{method:'POST'})).status,401)
    const headers = {Authorization:'Bearer '+token,'Content-Type':'application/json'}
    assert.equal((await fetch(url+'/v1/analyze',{method:'POST',headers,body:'{}'})).status,400)
    assert.equal((await fetch(url+'/v1/analyze',{method:'POST',headers,body:JSON.stringify({kind:'meeting',text:'sample'})})).status,503)
    assert.equal((await fetch(url+'/v1/mail',{method:'POST',headers,body:JSON.stringify({title:'sample',notes:{summary:'x',decisions:[],actions:[]}})})).status,503)
  } finally { await new Promise(resolve => server.close(resolve)) }
})

const token = 'synthetic-test-session-token-not-real'
const notes = { summary: 'Test summary', decisions: ['Test decision'], actions: ['Test action'] }
const ai = { OPENAI_API_KEY: 'test-placeholder' }
const mail = {
  GMAIL_CLIENT_ID: 'test-client',
  GMAIL_CLIENT_SECRET: 'test-placeholder',
  GMAIL_REFRESH_TOKEN: 'test-placeholder',
  STUDIO_MAIL_FROM: 'sender@example.test',
  STUDIO_MAIL_TO: 'recipient@example.test',
}

async function withServer(env, options, testServer) {
  const server = createStudioServer({ ...env, STUDIO_ACCESS_TOKEN: token }, options)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = 'http://127.0.0.1:' + server.address().port
  try {
    await testServer((path, input) => fetch(base + path, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        ...(input instanceof FormData ? {} : { 'Content-Type': input instanceof Blob ? input.type : 'application/json' }),
      },
      body: input instanceof FormData || input instanceof Blob ? input : JSON.stringify(input),
    }))
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
}

test('validates and forwards only explicit analysis and audio requests', async () => {
  const calls = []
  await withServer(ai, { fetchProvider: async (url, request) => {
    calls.push(url)
    assert.equal(request.redirect, 'error')
    if (url.endsWith('/transcriptions')) {
      assert.equal(request.body.get('file').type, 'audio/mp4')
      return Response.json({ text: 'Synthetic transcript' })
    }
    const body = JSON.parse(request.body)
    assert.deepEqual(JSON.parse(body.messages[1].content), { kind: 'meeting', text: 'Synthetic meeting' })
    return Response.json({ choices: [{ message: { content: JSON.stringify(notes) } }] })
  } }, async post => {
    const invalid = new FormData()
    invalid.append('file', new Blob(['x'], { type: 'text/plain' }), 'input.txt')
    assert.equal((await post('/v1/transcribe', invalid)).status, 400)
    assert.equal((await post('/v1/transcribe', {})).status, 400)
    assert.equal((await post('/v1/analyze', { text: 'x'.repeat(530_000), kind: 'meeting' })).status, 413)
    assert.deepEqual(calls, [])
    const audio = new FormData()
    audio.append('file', new Blob(['synthetic bytes'], { type: 'audio/mp4' }), 'sample.m4a')
    const transcript = await post('/v1/transcribe', audio)
    assert.equal(transcript.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await transcript.json(), { text: 'Synthetic transcript' })
    assert.deepEqual(await (await post('/v1/analyze', { kind: 'meeting', text: 'Synthetic meeting' })).json(), notes)
    assert.equal(calls.length, 2)
  })
})

test('enforces authenticated rate limits and maps provider failures', async () => {
  let time = 0
  let calls = 0
  await withServer(ai, {
    now: () => time,
    fetchProvider: async () => {
      if (++calls === 1) throw new DOMException('Synthetic timeout', 'TimeoutError')
      return Response.json({ choices: [{ message: { content: 'invalid JSON' } }] })
    },
  }, async post => {
    const request = () => post('/v1/analyze', { kind: 'task', text: 'Synthetic task' })
    assert.equal((await request()).status, 504)
    for (let i = 0; i < 11; i++) assert.equal((await request()).status, 502)
    assert.equal((await request()).status, 429)
    time = 60_000
    assert.equal((await request()).status, 502)
  })
})

test('mail deduplicates confirmed delivery and blocks uncertain retries', async () => {
  let sent = 0
  await withServer(mail, { fetchProvider: async (url, request) => {
    if (url.endsWith('/token')) return Response.json({ access_token: 'synthetic-access' })
    sent++
    assert.equal(url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send')
    assert.equal(request.headers.Authorization, 'Bearer synthetic-access')
    const mime = Buffer.from(JSON.parse(request.body).raw, 'base64url').toString()
    assert.match(mime, /To: recipient@example\.test\r\n/)
    assert.doesNotMatch(mime, /injected@example\.test/)
    if (sent === 2) throw new DOMException('Synthetic timeout', 'TimeoutError')
    return Response.json({ id: 'synthetic-confirmation' })
  } }, async post => {
    const payload = { title: 'Example\r\nBcc: injected@example.test', notes }
    assert.deepEqual(await (await post('/v1/mail', payload)).json(), { sent: true })
    assert.deepEqual(await (await post('/v1/mail', payload)).json(), { sent: true, duplicate: true })
    assert.equal((await post('/v1/mail', { ...payload, title: 'Second message' })).status, 504)
    assert.equal((await post('/v1/mail', { ...payload, title: 'Second message' })).status, 409)
    assert.equal(sent, 2)
  })
})

test('Padel extraction rejects other uploads and returns only a reviewable draft', async () => {
  let requested = false
  await withServer(ai, { fetchProvider: async (url, request) => {
    requested = true
    assert.equal(url, 'https://api.openai.com/v1/chat/completions')
    const message = JSON.parse(request.body).messages[1]
    assert.match(message.content[0].image_url.url, /^data:image\/png;base64,/)
    return Response.json({ choices: [{ message: { content: '{"ourScore":6,"theirScore":null,"needsReview":false}' } }] })
  } }, async post => {
    assert.equal((await post('/v1/padel/extract', new Blob(['not a png'], { type: 'image/png' }))).status, 400)
    assert.equal(requested, false)
    const header = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])
    assert.deepEqual(await (await post('/v1/padel/extract', new Blob([header], { type: 'image/png' }))).json(), {
      ourScore: 6, theirScore: null, needsReview: true,
    })
  })
})
