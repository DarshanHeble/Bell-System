import { Time, TimeData } from '@shared/type'
import FastPriorityQueue from 'fastpriorityqueue'
import { playAudio } from './utils/playAudio'
import { getCurrent24HourTime, getCurrentDayName } from '@shared/utils'

export const bellQueue = new FastPriorityQueue<TimeData>((a, b) => {
  const convertTo24Hour = (time: Time): number =>
    (time.period === 'pm' ? 12 : 0) + (time.hour % 12) + time.minute / 60

  return convertTo24Hour(a.time) < convertTo24Hour(b.time)
})

// Function to add data to the queue
export async function addToQueue(data: TimeData[]): Promise<void> {
  data.forEach((item) => {
    // if (item.switch_state) {
    bellQueue.add(item)
    // } else {
    //   console.log('Skipping the in-active time', item.label)
    // }
  })
}

export async function clearQueue(): Promise<void> {
  while (!bellQueue.isEmpty()) {
    bellQueue.poll() // Remove the top element until the queue is empty
  }
  console.log('Bell queue cleared.')
}

let isProcessing = false // Flag to prevent duplicate processing

export async function processNextBell(): Promise<void> {
  if (isProcessing) {
    console.log('Already processing the queue. Skipping this invocation.')
    return
  }

  isProcessing = true // Set the flag to true

  try {
    if (bellQueue.isEmpty()) {
      console.log('The queue is empty')
      return
    }

    // Check for the earliest valid item
    while (!bellQueue.isEmpty()) {
      const nextBell = bellQueue.peek() // Get the earliest time without removing it

      if (!nextBell) break

      // Skip inactive items
      if (!nextBell.switch_state) {
        console.log(`Skipping inactive bell: ${nextBell.label}`)
        bellQueue.poll() // Remove the inactive item
        continue
      }

      // Skip inactive items based on current day
      const currentDay = getCurrentDayName()
      const daySetting = nextBell.days.find((d) => d.day === currentDay)

      if (!daySetting || !daySetting.active) {
        console.log(`Skipping bell for ${currentDay} (day not active): ${nextBell.label}`)
        bellQueue.poll() // Remove the item inactive for today
        continue
      }

      const nextTime24Hour =
        (nextBell.time.period === 'pm' ? 12 : 0) +
        (nextBell.time.hour % 12) +
        nextBell.time.minute / 60

      if (nextTime24Hour < getCurrent24HourTime()) {
        // Time has passed; discard this item
        bellQueue.poll()
        console.log(
          `Skipped: ${nextBell.time.hour}:${nextBell.time.minute} ${nextBell.time.period} (time already passed)`
        )
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
            playAudio(nextBell.music_file_name)
            await processNextBell() // Process the next item
          },
          (nextTime24Hour - getCurrent24HourTime()) * 60 * 60 * 1000
        )

        break // Exit the loop after scheduling
      }
    }
  } finally {
    isProcessing = false // Reset the flag when processing is done
  }
}
