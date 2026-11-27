import { TextInput, View, StyleSheet } from 'react-native'
import { Action, Label } from './components'
import { useStudioTheme } from './theme'
export function Field({ label, value, onChange, multiline = false, secret = false, numeric = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; secret?: boolean; numeric?: boolean }) {
  const { colors } = useStudioTheme()
  return <View style={styles.field}>
    <Label variant="caption">{label}</Label>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} multiline={multiline} secureTextEntry={secret} keyboardType={numeric ? 'number-pad' : 'default'} autoCapitalize={secret ? 'none' : 'sentences'} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }, multiline && styles.multiline]} />
  </View>
}
export function ErrorText({ message }: { message: string }) { return message ? <Label tone="danger">{message}</Label> : null }
export function Choice({ label, choices, value, onChange }: { label: string; choices: string[]; value: string; onChange: (v: string) => void }) {
  return <View style={styles.field}><Label variant="caption">{label}</Label><Action title={value + ' · Change'} icon="swap-horizontal" onPress={() => onChange(choices[(choices.indexOf(value) + 1) % choices.length])} /></View>
}
const styles = StyleSheet.create({ field: { gap: 6 }, input: { minHeight: 48, borderWidth: 1, padding: 12, borderRadius: 12, fontSize: 16 }, multiline: { minHeight: 120, textAlignVertical: 'top' } })
