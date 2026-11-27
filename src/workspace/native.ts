import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo'

type Recorder = {
  permission(): Promise<boolean>
  start(): Promise<void>
  stop(): Promise<string>
  recording(): boolean
  readWorkspace(): Promise<string>
  writeWorkspace(value: string): Promise<void>
  removeAudio(uri: string): Promise<void>
}
export const device = Platform.OS === 'ios' ? requireOptionalNativeModule<Recorder>('StudioDevice') : null
