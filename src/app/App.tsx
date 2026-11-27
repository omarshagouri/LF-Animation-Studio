import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import { MeetingDetailsScreen, MeetingsScreen } from '../features/meetings/MeetingScreens'
import { MeetingProvider } from '../features/meetings/session'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { CaptureScreen } from '../features/capture/CaptureScreen'
import { SecretaryScreen } from '../features/secretary/SecretaryScreen'
import { PadelScreen } from '../features/padel/PadelScreen'
import { AmpCoreXScreen } from '../features/ampcorex/AmpCoreXScreen'
import { WorkspaceProvider } from '../workspace/Workspace'
import { useStudioTheme } from '../ui/theme'
import { PreviewFrame } from './PreviewFrame'
import type { StudioRoutes } from './routes'

const Stack = createNativeStackNavigator<StudioRoutes>()

export default function App() {
  const { isDark, colors } = useStudioTheme()
  const base = isDark ? DarkTheme : DefaultTheme
  return (
    <PreviewFrame>
      <SafeAreaProvider>
        <WorkspaceProvider>
          <MeetingProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NavigationContainer theme={{ ...base, colors: { ...base.colors, primary: colors.accent, background: colors.background, card: colors.background, text: colors.text, border: colors.border } }}>
              <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal' }}>
                <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Meetings" component={MeetingsScreen} options={{ title: 'Meetings' }} />
                <Stack.Screen name="MeetingDetails" component={MeetingDetailsScreen} options={{ title: 'Meeting details' }} />
                <Stack.Screen name="Capture" component={CaptureScreen} options={{ title: 'Universal Capture' }} />
                <Stack.Screen name="Secretary" component={SecretaryScreen} options={{ title: 'Personal Secretary' }} />
                <Stack.Screen name="Padel" component={PadelScreen} options={{ title: 'Padel Intelligence' }} />
                <Stack.Screen name="AmpCoreX" component={AmpCoreXScreen} options={{ title: 'AmpCoreX' }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
              </Stack.Navigator>
            </NavigationContainer>
          </MeetingProvider>
        </WorkspaceProvider>
      </SafeAreaProvider>
    </PreviewFrame>
  )
}
