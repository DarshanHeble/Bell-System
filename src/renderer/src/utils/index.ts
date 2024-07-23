import { Tab, Time } from '@shared/type'

export const getCurrentTime = (): Time => {
  const now = new Date()
  let hour = now.getHours()
  const minute = now.getMinutes()
  const isPm = hour >= 12

  if (hour > 12) {
    hour -= 12
  } else if (hour === 0) {
    hour = 12
  }

  return {
    hour: hour,
    minute: minute,
    period: isPm ? 'pm' : 'am'
  }
}

let isPlayingAudio = false

export const checkTimeMatch = (tabs: Tab[]): void => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentPeriod = currentHour >= 12 ? 'pm' : 'am'
  const formattedHour = currentHour % 12 || 12 // Convert to 12-hour format

  tabs.forEach((tab: Tab) => {
    tab.data.forEach(async (item) => {
      const { hour, minute, period } = item.time

      if (
        hour === formattedHour &&
        minute === currentMinute &&
        period === currentPeriod &&
        !isPlayingAudio
      ) {
        isPlayingAudio = true
        console.log(`Time matched for label: ${item.label} at ${hour}:${minute} ${period}`)
        await window.electron.ipcRenderer.invoke('playAudio', item.music_file_name)
        console.log('Audio played fully and returned to Renderer')
        isPlayingAudio = false
      }
    })
  })
}
