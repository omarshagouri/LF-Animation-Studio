import { Platform } from 'react-native'
import { validNotes, type Notes, type CaptureKind } from './model'
type Connection = { url: string; token: string }
async function request(c: Connection, path: string, body: unknown, multipart = false): Promise<unknown> {
  if (Platform.OS !== 'ios') throw new Error('Remote processing is disabled in the public browser preview.')
  if (!/^https:\/\/[^\s]+$/.test(c.url) || !c.token) throw new Error('Connect a private HTTPS backend in Settings first.')
  const response = await fetch(c.url.replace(/\/+$/, '') + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + c.token, ...(multipart ? {} : { 'Content-Type': 'application/json' }) },
    body: multipart ? body as FormData : JSON.stringify(body),
  })
  if (!response.ok) throw new Error('Backend request failed (' + response.status + '). No success was recorded.')
  return response.json()
}
export async function analyze(c: Connection, text: string, kind: CaptureKind): Promise<Notes> {
  const value = await request(c, '/v1/analyze', { text, kind })
  if (!validNotes(value)) throw new Error('Invalid analysis response')
  return value
}
export async function transcribe(c: Connection, uri: string): Promise<string> {
  const form = new FormData()
  form.append('file', { uri, name: 'meeting.m4a', type: 'audio/mp4' } as unknown as Blob)
  const value = await request(c, '/v1/transcribe', form, true) as { text?: unknown }
  if (typeof value.text !== 'string' || !value.text.trim()) throw new Error('Empty transcript')
  return value.text
}
export async function sendNotes(c: Connection, title: string, notes: Notes) {
  const value = await request(c, '/v1/mail', { title, notes }) as { sent?: unknown }
  if (value.sent !== true) throw new Error('Mail delivery not confirmed')
}
