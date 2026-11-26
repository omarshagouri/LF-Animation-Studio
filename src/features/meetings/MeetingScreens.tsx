import { useEffect, useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { StudioRoutes } from '../../app/routes'
import { Action, Card, IconTile, Label, NavigationRow, Screen } from '../../ui/components'
import { formatDuration, formatMeetingDate, meetingStatus } from './model'
import { useMeetingSession } from './session'

function RecordingTimer({ startedAt }: { startedAt: number | null }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (startedAt === null) return
    const interval = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(interval)
  }, [startedAt])

  return <Label variant="timer">{formatDuration(startedAt === null ? 0 : now - startedAt)}</Label>
}

export function MeetingsScreen({ navigation }: NativeStackScreenProps<StudioRoutes, 'Meetings'>) {
  const { startedAt, history, start, stop } = useMeetingSession()
  const active = startedAt !== null
  return (
    <Screen>
      <Label variant="title">AI Meeting Assistant</Label>
      <Card>
        <IconTile name="mic-outline" />
        <Label variant="heading" tone={active ? 'danger' : 'text'}>{active ? 'Simulated recording' : 'Recording demo'}</Label>
        <RecordingTimer startedAt={startedAt} />
        <Label variant="caption" tone="muted">The demo uses a timer. It does not access your microphone.</Label>
        <Action title={active ? 'Stop recording' : 'Start recording'} icon={active ? 'stop' : 'mic'} onPress={active ? stop : start} />
      </Card>
      <Label variant="heading">Meeting history</Label>
      {history.length === 0 && (
        <Card><Label tone="muted">Completed demo sessions appear here.</Label></Card>
      )}
      {history.map(meeting => (
        <NavigationRow
          key={meeting.id}
          title={meeting.title}
          subtitle={`${formatMeetingDate(meeting.startedAt)} · ${meetingStatus[meeting.status]}`}
          icon="document-text-outline"
          onPress={() => navigation.navigate('MeetingDetails', { meetingId: meeting.id })}
        />
      ))}
    </Screen>
  )
}

export function MeetingDetailsScreen({ route }: NativeStackScreenProps<StudioRoutes, 'MeetingDetails'>) {
  const { history } = useMeetingSession()
  const meeting = history.find(item => item.id === route.params.meetingId)
  if (!meeting) {
    return <Screen><Label variant="title">Meeting unavailable</Label></Screen>
  }

  return (
    <Screen>
      <Label variant="title">{meeting.title}</Label>
      <Card>
        <Label variant="heading">Session details</Label>
        <Label tone="muted">{formatMeetingDate(meeting.startedAt)}</Label>
        <Label>Duration · {formatDuration(meeting.durationMs)}</Label>
      </Card>
      <Card>
        <Label variant="heading">Processing</Label>
        <Label tone="accent">{meetingStatus[meeting.status]}</Label>
        <Label tone="muted">Transcripts and summaries will be available when processing is connected.</Label>
      </Card>
    </Screen>
  )
}
