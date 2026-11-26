import { Card, Label, Screen } from '../../ui/components'
import { useStudioTheme } from '../../ui/theme'

export function SettingsScreen() {
  const { isDark } = useStudioTheme()
  return (
    <Screen>
      <Label variant="title">Settings</Label>
      <Card>
        <Label variant="heading">Appearance</Label>
        <Label tone="muted">Follows iPhone settings · {isDark ? 'Dark' : 'Light'}</Label>
      </Card>
      <Card>
        <Label variant="heading">Meeting data</Label>
        <Label tone="muted">Demo meetings are stored for the current app session and clear when the app restarts.</Label>
      </Card>
    </Screen>
  )
}
