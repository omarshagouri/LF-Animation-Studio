import { useColorScheme } from 'react-native'

const light = {
  background: '#F4F5F9',
  surface: '#FFFFFF',
  text: '#161824',
  muted: '#555D71',
  accent: '#4C42BA',
  tint: '#ECE9FF',
  border: '#DDE0EC',
  danger: '#A62D42',
  onAccent: '#FFFFFF',
}

const dark: typeof light = {
  background: '#11121A',
  surface: '#1C1E2B',
  text: '#F5F5FF',
  muted: '#B4B9CE',
  accent: '#B7AAFF',
  tint: '#312750',
  border: '#373A4F',
  danger: '#FFA4B2',
  onAccent: '#18132E',
}

export const spacing = { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 }
export const radius = { control: 14, card: 24 }

export function useStudioTheme() {
  const isDark = useColorScheme() === 'dark'
  return { isDark, colors: isDark ? dark : light }
}
