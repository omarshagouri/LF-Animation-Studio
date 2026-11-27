import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo'
import type { SavedMeeting } from './model'

type Recorder = {
  permission(): Promise<boolean>
  start(title: string): Promise<void>
  stop(): Promise<SavedMeeting>
  recording(): Promise<boolean>
  recoverRecordings(): Promise<SavedMeeting[]>
  acknowledgeRecordings(ids: string[]): Promise<void>
  readWorkspace(): Promise<string>
  writeWorkspace(value: string): Promise<void>
  removeAudio(uri: string): Promise<void>
}
export const device = Platform.OS === 'ios' ? requireOptionalNativeModule<Recorder>('StudioDevice') : null
