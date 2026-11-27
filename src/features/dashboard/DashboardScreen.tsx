import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { StudioRoutes } from '../../app/routes'
import { Card, Label, NavigationRow, Screen } from '../../ui/components'
import { useWorkspace } from '../../workspace/Workspace'
import { Platform } from 'react-native'

export function DashboardScreen({ navigation }: NativeStackScreenProps<StudioRoutes, 'Dashboard'>) {
  const { data, ready, storageError } = useWorkspace()
  const pending = data.tasks.filter(t => !t.done).length
  return <Screen topInset>
    <Label variant="title">Omar Studio</Label>
    <Label tone="muted">Your personal AI workspace</Label>
    <Card>
      <Label variant="heading">Today at a glance</Label>
      <Label>{pending} open actions · {data.meetings.length} saved meetings</Label>
      <Label>{data.captures.length} captures · {data.production.filter(p => p.stage !== 'Published').length} production items</Label>
      <Label variant="caption" tone="muted">{Platform.OS === 'web' ? 'Public preview · session-only sample data; do not enter confidential information.' : ready ? 'Private on-device workspace' : 'Loading workspace…'}</Label>
      {storageError ? <Label tone="danger">{storageError}</Label> : null}
    </Card>
    <Label variant="heading">Your tools</Label>
    <NavigationRow title="AI Meeting Assistant" subtitle="Record, transcribe and turn discussions into actions" icon="mic-outline" onPress={() => navigation.navigate('Meetings')} />
    <NavigationRow title="Universal Capture" subtitle="Collect text, links and notes in one inbox" icon="scan-outline" onPress={() => navigation.navigate('Capture')} />
    <NavigationRow title="Personal Secretary" subtitle="Tasks, deadlines and follow-ups" icon="calendar-outline" onPress={() => navigation.navigate('Secretary')} />
    <NavigationRow title="Padel Intelligence" subtitle="Match results, partners and playing sides" icon="trophy-outline" onPress={() => navigation.navigate('Padel')} />
    <NavigationRow title="AmpCoreX Control Center" subtitle="Track long-form and short-form production" icon="videocam-outline" onPress={() => navigation.navigate('AmpCoreX')} />
    <NavigationRow title="Settings" subtitle="Privacy, storage and private backend" icon="settings-outline" onPress={() => navigation.navigate('Settings')} />
  </Screen>
}
