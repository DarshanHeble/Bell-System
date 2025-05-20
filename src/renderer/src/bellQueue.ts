import { Time, TimeData } from '@shared/type' // Assuming Day is also in @shared/type
import FastPriorityQueue from 'fastpriorityqueue'
import { playAudio } from './utils/playAudio'

export const bellQueue = new FastPriorityQueue<TimeData>((a, b) => {
  const convertTo24Hour = (time: Time): number =>
    (time.period === 'pm' ? 12 : 0) + (time.hour % 12) + time.minute / 60

  return convertTo24Hour(a.time) < convertTo24Hour(b.time)
})

// Function to add data to the queue
export async function addToQueue(data: TimeData[]): Promise<void> {
  data.forEach((item) => {
    // if (item.switch_state) { // You might want to keep this check or remove if processNextBell handles all inactive cases
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

// Utility to get the current time in 24-hour format for comparison
function getCurrent24HourTime(): number {
  const now = new Date()
  const hour = now.getHours() // 0-23
  const minute = now.getMinutes()
  return hour + minute / 60
}

// Utility to get the current day name (e.g., "Sunday", "Monday")
function getCurrentDayName(): string {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const now = new Date()
  return daysOfWeek[now.getDay()]
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

      // Skip inactive items based on switch_state
      if (!nextBell.switch_state) {
        console.log(`Skipping inactive bell (switch_state is false): ${nextBell.label}`)
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
          `Skipped: ${nextBell.label} - ${nextBell.time.hour}:${nextBell.time.minute} ${nextBell.time.period} (time already passed)`
        )
      } else {
        // Time is valid; process this item
        console.log(`Processing: ${nextBell.label}`)
        bellQueue.poll() // Remove it now that we are scheduling it

        // Simulate setting up for the next task (e.g., scheduling an alarm)
        setTimeout(
          async () => {
            console.log(
              `Executing: ${nextBell.label} at ${nextBell.time.hour}:${nextBell.time.minute} ${nextBell.time.period}`
            )
            playAudio(nextBell.music_file_name)
            // After execution, immediately try to process the next bell from the queue
            // This ensures that if multiple bells were scheduled for very close times,
            // or if a new bell is added while waiting, it gets processed.
            // We set isProcessing to false before calling processNextBell again
            // to allow the next call to proceed.
            isProcessing = false // Allow next call to proceed
            await processNextBell()
          },
          (nextTime24Hour - getCurrent24HourTime()) * 60 * 60 * 1000
        )

        // Important: Since we've scheduled an async task (setTimeout),
        // we should NOT reset isProcessing here immediately.
        // It will be reset either in the finally block if an error occurs
        // or just before calling processNextBell() inside the setTimeout callback.
        // For this structure, we want to break the loop and wait for the setTimeout.
        return // Exit the function, as we've scheduled the next bell
      }
    }

    // If the loop finishes without scheduling anything (e.g., all items were skipped or queue became empty)
    isProcessing = false // Reset the flag if loop finished without scheduling
  } catch (error) {
    console.error('Error processing bell queue:', error)
    isProcessing = false // Ensure flag is reset on error
  }
}
