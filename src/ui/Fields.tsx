import { Pressable, Text, TextInput, View, StyleSheet } from 'react-native'
import { Label } from './components'
import { useStudioTheme } from './theme'
export function Field({ label, value, onChange, multiline = false, secret = false, numeric = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; secret?: boolean; numeric?: boolean }) {
  const { colors } = useStudioTheme()
  return <View style={styles.field}>
    <Label variant="caption">{label}</Label>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} multiline={multiline} secureTextEntry={secret} keyboardType={numeric ? 'number-pad' : 'default'} autoCapitalize={secret ? 'none' : 'sentences'} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }, multiline && styles.multiline]} />
  </View>
}
export function ErrorText({ message }: { message: string }) { return message ? <Label tone="danger">{message}</Label> : null }
export function Choice<T extends string>({ label, choices, value, onChange }: {
  label: string; choices: readonly T[]; value: T; onChange: (v: T) => void
}) {
  const { colors } = useStudioTheme()
  return <View style={styles.field}>
    <Label variant="caption">{label}</Label>
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
      {choices.map(choice => {
        const selected = choice === value
        return <Pressable key={choice} accessibilityRole="radio" accessibilityLabel={label + ': ' + choice}
          aria-checked={selected} onPress={() => onChange(choice)}
          style={[styles.choice, { backgroundColor: selected ? colors.tint : colors.background, borderColor: selected ? colors.accent : colors.border }]}>
          <Text style={{ color: selected ? colors.accent : colors.text, fontWeight: selected ? '600' : '400' }}>{choice}</Text>
        </Pressable>
      })}
    </View>
  </View>
}
const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { minHeight: 48, borderWidth: 1, padding: 12, borderRadius: 12, fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center', borderWidth: 1, borderRadius: 12 },
})
