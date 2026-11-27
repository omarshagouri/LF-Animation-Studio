import type { ComponentProps, PropsWithChildren } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { radius, spacing, useStudioTheme } from './theme'

type IconName = ComponentProps<typeof Ionicons>['name']
type Tone = 'text' | 'muted' | 'accent' | 'danger'

export function Label({ children, variant = 'body', tone = 'text' }: PropsWithChildren<{
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'timer'
  tone?: Tone
}>) {
  const { colors } = useStudioTheme()
  const heading = variant === 'title' || variant === 'heading'
  return (
    <Text accessibilityRole={heading ? 'header' : undefined} style={[styles[variant], { color: colors[tone] }]}>
      {children}
    </Text>
  )
}

export function Screen({ children, topInset = false }: PropsWithChildren<{ topInset?: boolean }>) {
  const { colors } = useStudioTheme()
  const insets = useSafeAreaInsets()
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior={topInset ? "never" : "automatic"}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.screen, topInset && {
        paddingTop: insets.top + spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
      }]}
    >
      {children}
    </ScrollView>
  )
}

export function Card({ children }: PropsWithChildren) {
  const { colors } = useStudioTheme()
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
}

export function Glyph({ name, size = 24 }: { name: IconName; size?: number }) {
  const { colors } = useStudioTheme()
  return <Ionicons accessible={false} name={name} size={size} color={colors.accent} />
}

export function IconTile({ name }: { name: IconName }) {
  const { colors } = useStudioTheme()
  return <View style={[styles.iconTile, { backgroundColor: colors.tint }]}><Glyph name={name} /></View>
}

export function Action({ title, icon, onPress, disabled = false, variant = 'primary' }: {
  title: string
  icon: IconName
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  const { colors } = useStudioTheme()
  const backgroundColor = variant === 'primary' ? colors.accent : colors.background
  const color = variant === 'primary' ? colors.onAccent : variant === 'danger' ? colors.danger : colors.accent
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.action, { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}>
      <Ionicons accessible={false} name={icon} size={19} color={color} />
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </Pressable>
  )
}

export function NavigationRow({ title, subtitle, icon, onPress }: {
  title: string; subtitle: string; icon: IconName; onPress: () => void
}) {
  const { colors } = useStudioTheme()
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [
      styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
    ]}>
      <IconTile name={icon} />
      <View style={styles.rowText}>
        <Label variant="heading">{title}</Label>
        <Label variant="caption" tone="muted">{subtitle}</Label>
      </View>
      <Glyph name="chevron-forward" size={18} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 600, alignSelf: 'center' },
  card: { padding: spacing.lg, gap: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.card },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  heading: { fontSize: 19, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  timer: { fontSize: 42, fontWeight: '600', fontVariant: ['tabular-nums'] },
  iconTile: { width: 48, height: 48, borderRadius: radius.control, justifyContent: 'center', alignItems: 'center' },
  action: { minHeight: 50, borderRadius: radius.control, padding: spacing.sm, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  buttonText: { fontWeight: '600', fontSize: 16, flexShrink: 1 },
  row: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.card },
  rowText: { flex: 1, gap: spacing.xs },
})
