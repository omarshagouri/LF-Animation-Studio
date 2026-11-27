import { useState } from 'react'
import { Platform } from 'react-native'
import { Action, Card, Label, Screen } from '../../ui/components'
import { ErrorText, Field } from '../../ui/Fields'
import { useStudioTheme } from '../../ui/theme'
import { useWorkspace } from '../../workspace/Workspace'
export function SettingsScreen() {
  const { isDark } = useStudioTheme()
  const { connection, connect, storageError } = useWorkspace()
  const [url, setUrl] = useState(connection.url)
  const [token, setToken] = useState(connection.token)
  const [message, setMessage] = useState('')
  return <Screen><Label variant="title">Settings</Label>
    <Card><Label variant="heading">Appearance</Label><Label tone="muted">System appearance · {isDark ? 'Dark' : 'Light'}</Label></Card>
    <Card><Label variant="heading">Data and privacy</Label><Label>{Platform.OS === 'web' ? 'Public preview: data is in memory only. Do not enter real personal or professional information.' : 'Data is stored in the application sandbox. Audio remains local until you explicitly request transcription.'}</Label><Label tone="muted">Obtain appropriate consent before recording. Delete recordings when no longer needed. Remote processing sends selected content to the configured private server.</Label><ErrorText message={storageError} /></Card>
    {Platform.OS === 'ios' && <Card><Label variant="heading">Private backend</Label><Label variant="caption" tone="muted">Connection is held in memory until the app closes. Provider credentials stay on the server.</Label><Field label="Backend HTTPS URL" value={url} onChange={setUrl} /><Field label="Access token" secret value={token} onChange={setToken} /><Action title="Set session connection" icon="link-outline" onPress={() => { if (!/^https:\/\/[^\s]+$/.test(url.trim()) || !token.trim()) { setMessage('Enter a valid HTTPS URL and access token.'); return } connect({ url: url.trim(), token: token.trim() }); setMessage('Session configured; connectivity is verified on the first request.') }} /><Action title="Disconnect" icon="close-outline" onPress={() => { connect({ url: '', token: '' }); setUrl(''); setToken(''); setMessage('Disconnected.') }} /><Label tone="muted">{message}</Label></Card>}
    <Card><Label variant="heading">Integration status</Label><Label>AI and email require a deployed private backend. Gmail, Calendar, Sheets, Padelboard and AmpCoreX live connectors are not configured.</Label></Card>
  </Screen>
}
