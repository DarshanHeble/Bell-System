import { Tab, Time } from '@shared/type'

let isPlayingAudio = false
let lastPlayedMinute: number | null = null // Track the last played minute

export const checkTimeMatch = (tabs: Tab[], activeTab: string): void => {
  const now = new Date()
  const currentMinute = now.getMinutes()

  // Ensure the bell plays only once per minute
  if (isPlayingAudio || currentMinute === lastPlayedMinute) {
    return
  }

  tabs.forEach((tab: Tab) => {
    if (tab._id === activeTab) {
      tab.data.forEach(async (item) => {
        const { hour, minute, period } = item.time
        const currentHour = now.getHours()
        const currentPeriod = currentHour >= 12 ? 'pm' : 'am'
        const formattedHour = currentHour % 12 || 12 // Convert to 12-hour format
        const currentDay = now.getDay()

        if (
          hour === formattedHour &&
          minute === currentMinute &&
          period === currentPeriod &&
          item.days[currentDay].active === true
        ) {
          isPlayingAudio = true
          console.log(`Time matched for label: ${item.label} at ${hour}:${minute} ${period}`)

          // call API for playing audio
          await window.electron.ipcRenderer.invoke(
            'playAudio',
            item.music_file_name,
            tab.tab_name,
            item
          )
          console.log('Audio played fully and returned to Renderer')
          isPlayingAudio = false

          // Update last played minute
          lastPlayedMinute = currentMinute
        }
      })
    }
  })
}

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
