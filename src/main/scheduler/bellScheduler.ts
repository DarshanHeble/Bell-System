import { Time, TimeData } from '@shared/type'
import { getCurrent24HourTime, getCurrentDayName } from '@shared/utils'
import { BrowserWindow } from 'electron'
import FastPriorityQueue from 'fastpriorityqueue'

let mainWindow: BrowserWindow | null = null
let currentlyScheduledBell: TimeData | null = null // Variable to store the bell being processed for execution
let executionTimerId: NodeJS.Timeout | null = null // To store the ID of the setTimeout

export function setMainWindow(win: BrowserWindow): void {
  mainWindow = win
}

// Function to get the currently scheduled bell (can be called from other main process modules if needed)
export function getCurrentlyScheduledBell(): TimeData | null {
  return currentlyScheduledBell
}

// Function to clear any existing scheduled timer and reset state
export function clearExistingTimerAndScheduledBell(): void {
  if (executionTimerId) {
    clearTimeout(executionTimerId)
    executionTimerId = null
  }
  currentlyScheduledBell = null
  // Also inform frontend that the schedule might be void now or re-evaluated
  if (mainWindow) {
    mainWindow.webContents.send('schedule-updated', null) // Or re-peek after clearing
  }
}

export const bellQueue = new FastPriorityQueue<TimeData>((a, b) => {
  const convertTo24Hour = (time: Time): number =>
    (time.period === 'pm' && time.hour !== 12
      ? 12
      : time.period === 'am' && time.hour === 12
        ? -12
        : 0) +
    time.hour +
    time.minute / 60
  return convertTo24Hour(a.time) < convertTo24Hour(b.time)
})

// Function to add data to the queue
export async function addToQueue(data: TimeData[]): Promise<void> {
  data.forEach((item) => {
    bellQueue.add(item)
  })
  // If something is added, the current schedule might need re-evaluation
  // A simple way is to clear the current timer and re-process
  clearExistingTimerAndScheduledBell() // Clear previous timer
  isProcessing = false // Allow processNextBell to run
  await processNextBell()
}

export async function clearQueue(): Promise<void> {
  clearExistingTimerAndScheduledBell() // Clear previous timer

  while (!bellQueue.isEmpty()) {
    bellQueue.poll() // Remove the top element until the queue is empty
  }
  console.log('Bell queue cleared.')

  if (mainWindow) {
    mainWindow.webContents.send('schedule-updated', null)
  }

  currentlyScheduledBell = null
  isProcessing = false
}

let isProcessing = false // Flag to prevent duplicate processing

export async function processNextBell(): Promise<void> {
  if (!mainWindow) {
    console.log('Main window not set, cannot process bell.')
    isProcessing = false // Reset if no window
    return
  }

  if (isProcessing) {
    // console.log('Backend: Already processing. Skipping.');
    return
  }

  isProcessing = true
  clearExistingTimerAndScheduledBell() // Clear any previous timer before processing new

  try {
    if (bellQueue.isEmpty()) {
      console.log('Backend: Queue is empty.')
      currentlyScheduledBell = null
      mainWindow.webContents.send('schedule-updated', null) // Inform frontend
      return
    }

    while (!bellQueue.isEmpty()) {
      const nextBell = bellQueue.peek()
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
        bellQueue.poll()
        continue
      }

      const nextTime24Hour =
        (nextBell.time.period === 'pm' && nextBell.time.hour !== 12 ? 12 : 0) + // Add 12 for PM, unless 12 PM
        (nextBell.time.period === 'am' && nextBell.time.hour === 12 ? -12 : 0) + // Subtract 12 for 12 AM (to make it 0-hour)
        nextBell.time.hour +
        nextBell.time.minute / 60

      const currentTime24 = getCurrent24HourTime()

      if (nextTime24Hour < currentTime24) {
        // Time has passed; discard this item
        bellQueue.poll()
        console.log(
          `Skipped: ${nextBell.label} - ${nextBell.time.hour}:${nextBell.time.minute} ${nextBell.time.period} (time already passed)`
        )
        continue
      } else {
        console.log(`Backend: Scheduling: ${nextBell.label}`)

        currentlyScheduledBell = nextBell // Store the bell that is now actively being scheduled
        mainWindow.webContents.send('schedule-updated', nextBell) // Inform frontend of next bell

        const delay = (nextTime24Hour - currentTime24) * 60 * 60 * 1000

        executionTimerId = setTimeout(
          async () => {
            try {
              const itemToExecute = bellQueue.peek() // Re-peek, state might have changed

              if (!itemToExecute || itemToExecute.id !== nextBell.id) {
                console.log(
                  `Backend: Scheduled item ${nextBell.label} is no longer at queue top or changed.`
                )
              } else {
                // Re-validate all conditions at the moment of execution
                const stillActiveSwitch = itemToExecute.switch_state
                const currentDayAtExecution = getCurrentDayName()
                const daySettingAtExecution = itemToExecute.days.find(
                  (d) => d.day === currentDayAtExecution
                )
                const stillActiveDay = daySettingAtExecution && daySettingAtExecution.active

                if (stillActiveSwitch && stillActiveDay) {
                  bellQueue.poll() // Remove it now that it's executing
                  console.log(`Backend: Executing: ${itemToExecute.label}`)
                  if (mainWindow) {
                    mainWindow.webContents.send(
                      'play-audio',
                      itemToExecute.music_file_name,
                      itemToExecute.label
                    )
                  }
                } else {
                  console.log(
                    `Backend: Bell ${itemToExecute.label} no longer valid at execution time (switch: ${stillActiveSwitch}, dayActive: ${stillActiveDay}). Polling.`
                  )
                  bellQueue.poll() // Remove it as it was due but became invalid
                }
              }
            } catch (execError) {
              console.error('Backend: Error during scheduled execution: ', execError)
            } finally {
              currentlyScheduledBell = null // Clear after execution attempt
              executionTimerId = null // Clear timerId
              isProcessing = false
              await processNextBell()
            }
          },
          delay > 0 ? delay : 0 // Ensure delay is not negative
        )
        return // Exit since a bell has been scheduled
      }
    }

    // If loop finished, means queue might be empty or all items skipped
    currentlyScheduledBell = null
    if (bellQueue.isEmpty()) {
      mainWindow.webContents.send('schedule-updated', null)
    } else {
      // Queue has items, but they were all skipped (past, inactive day, etc.)
      mainWindow.webContents.send('schedule-updated', bellQueue.peek())
    }
  } catch (error) {
    console.error('Error processing bell queue:', error)
  } finally {
    if (!executionTimerId) {
      // Only reset if no timer was set in this run
      isProcessing = false
    }
  }
}
