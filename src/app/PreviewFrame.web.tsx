import type { PropsWithChildren } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { useStudioTheme } from '../ui/theme'

export function PreviewFrame({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions()
  const { isDark, colors } = useStudioTheme()

  if (width < 560) return <View style={styles.fill}>{children}</View>

  return (
    <View style={[styles.stage, { backgroundColor: isDark ? '#090A10' : '#E4E6EF' }]}>
      <View style={[styles.phone, { backgroundColor: colors.background, borderColor: isDark ? '#373944' : '#292B36' }]}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  phone: {
    width: 390,
    height: 844,
    maxHeight: '100%',
    borderWidth: 8,
    borderRadius: 42,
    overflow: 'hidden',
    boxShadow: '0px 20px 64px rgba(0, 0, 0, 0.25)',
  },
})
