import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { StudioRoutes } from '../../app/routes'
import { Label, NavigationRow, Screen } from '../../ui/components'

export function DashboardScreen({ navigation }: NativeStackScreenProps<StudioRoutes, 'Dashboard'>) {
  return (
    <Screen topInset>
      <Label variant="title">Omar Studio</Label>
      <Label variant="heading">Tools</Label>
      <NavigationRow
        title="AI Meeting Assistant"
        subtitle="Manage meeting sessions and review their status"
        icon="mic-outline"
        onPress={() => navigation.navigate('Meetings')}
      />
      <NavigationRow
        title="Settings"
        subtitle="Appearance and app information"
        icon="settings-outline"
        onPress={() => navigation.navigate('Settings')}
      />
    </Screen>
  )
}
