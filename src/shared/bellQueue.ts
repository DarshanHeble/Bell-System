import FastPriorityQueue from 'fastpriorityqueue'
import { Tab, Time, TimeData } from './type'

export const bellQueue = new FastPriorityQueue<TimeData>((a, b) => {
  const convertTo24Hour = (time: Time): number =>
    (time.period === 'pm' ? 12 : 0) + (time.hour % 12) + time.minute / 60

  return convertTo24Hour(a.time) < convertTo24Hour(b.time)
})

// Utility to get the current time in 24-hour format for comparison
function getCurrent24HourTime(): number {
  const now = new Date()
  const hour = now.getHours() // 0-23
  const minute = now.getMinutes()
  return hour + minute / 60
}

// Add multiple bell data to the queue
export async function addBellData(tab: Tab): Promise<void> {
  tab.data.forEach((element) => {
    bellQueue.add(element)
  })
}

// Get and handle the earliest time data
export async function processNextBell(): Promise<void> {
  if (bellQueue.isEmpty()) {
    console.log('The queue is empty')
    return
  }

  // Check for the earliest valid item
  while (!bellQueue.isEmpty()) {
    const nextBell = bellQueue.peek() // Get the earliest time without removing it
    if (!nextBell) break

    const nextTime24Hour =
      (nextBell.time.period === 'pm' ? 12 : 0) +
      (nextBell.time.hour % 12) +
      nextBell.time.minute / 60

    if (nextTime24Hour <= getCurrent24HourTime()) {
      // Time has passed; discard this item
      bellQueue.poll()
      console.log(`Skipped: ${nextBell.label} (time already passed)`)
    } else {
      // Time is valid; process this item
      console.log(`Processing: ${nextBell.label}`)
      bellQueue.poll()

      // Simulate setting up for the next task (e.g., scheduling an alarm)
      setTimeout(
        async () => {
          console.log(
            `Executing: ${nextBell.label} at ${nextBell.time.hour}:${nextBell.time.minute} ${nextBell.time.period}`
          )
          await processNextBell() // Process the next item
        },
        (nextTime24Hour - getCurrent24HourTime()) * 60 * 60 * 1000
      )

      break // Exit the loop after scheduling
    }
  }
}

// Example Usage
// ;(async () => {
//   const tab: Tab = {
//     data: [
//       {
//         id: '1',
//         time: { hour: 8, minute: 30, period: 'am' },
//         label: 'Morning Alarm',
//         music_file_name: 'alarm1.mp3',
//         days: [{ day: 'Monday', active: true }],
//         switch_state: true
//       },
//       {
//         id: '2',
//         time: { hour: 9, minute: 0, period: 'am' },
//         label: 'Meeting Reminder',
//         music_file_name: 'reminder.mp3',
//         days: [{ day: 'Tuesday', active: true }],
//         switch_state: true
//       }
//     ]
//   }

//   await addBellData(tab)
//   await processNextBell() // Start processing the queue
// })()
