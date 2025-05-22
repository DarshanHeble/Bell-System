import { Time, TimeData } from '@shared/type'
import { getCurrent24HourTime, getCurrentDayName } from '@shared/utils'
import { BrowserWindow } from 'electron'
import FastPriorityQueue from 'fastpriorityqueue'

let mainWindow: BrowserWindow | null = null
let currentlyScheduledBell: TimeData | null = null
let executionTimerId: NodeJS.Timeout | null = null
let isProcessing = false

// --- Variables to store active tab info ---
let currentScheduledTabId: string | null = null
let currentScheduledTabName: string | null = null

// --- Internal Helper Functions ---
function clearExistingTimerAndScheduledBellState(): void {
  if (executionTimerId) {
    clearTimeout(executionTimerId)
    executionTimerId = null
  }
  currentlyScheduledBell = null
}

// Store a reference to all items *intended* to be in the queue, keyed by ID.
// This helps in marking items as "logically deleted" or "updated".
const activeItemRegistry = new Map<string, TimeData>()

const compareTimeData = (a: TimeData, b: TimeData): boolean => {
  const convertTo24Hour = (time: Time): number =>
    (time.period === 'pm' && time.hour !== 12
      ? 12
      : time.period === 'am' && time.hour === 12
        ? -12
        : 0) +
    time.hour +
    time.minute / 60
  return convertTo24Hour(a.time) < convertTo24Hour(b.time)
}

const bellQueue = new FastPriorityQueue<TimeData>(compareTimeData)

// async function internalAddToQueue(data: TimeData[]): Promise<void> {
//   data.forEach((item) => {
//     if (item.id && item.switch_state) {
//       // Only add if it has an ID and is active
//       activeItemRegistry.set(item.id, item) // Track it
//       bellQueue.add(item)
//     }
//   })
// }

async function internalClearQueue(): Promise<void> {
  while (!bellQueue.isEmpty()) {
    bellQueue.poll()
  }
  activeItemRegistry.clear() // Clear the registry too
  currentScheduledTabId = null
  currentScheduledTabName = null
}

async function internalProcessNextBell(): Promise<void> {
  if (!mainWindow) {
    console.log('Backend: Main window not set. Cannot process bell.')
    isProcessing = false
    return
  }
  if (isProcessing) return

  isProcessing = true
  clearExistingTimerAndScheduledBellState()

  try {
    while (!bellQueue.isEmpty()) {
      // Loop to discard stale/invalid items from top
      const nextBellToConsider = bellQueue.peek()
      if (!nextBellToConsider || !nextBellToConsider.id) {
        // Should have ID
        bellQueue.poll() // Invalid item
        continue
      }

      // Check against the registry for validity (latest switch_state, or if deleted)
      const registeredItem = activeItemRegistry.get(nextBellToConsider.id)
      if (!registeredItem || !registeredItem.switch_state) {
        console.log(
          `Backend: Discarding stale/inactive item from queue: ${nextBellToConsider.label}`
        )
        bellQueue.poll()
        if (registeredItem && !registeredItem.switch_state) {
          // If explicitly made inactive
          activeItemRegistry.delete(nextBellToConsider.id) // Remove from registry if now inactive
        }
        continue // Try next item in queue
      }

      // Ensure the item in queue reflects the latest from registry (mainly for days array if it could change)
      // For simplicity, we assume 'days' doesn't change without a full update operation.
      // If 'days' could change independently, you'd need to ensure the queue item uses 'registeredItem.days'.
      // This example assumes the item in the queue is sufficiently up-to-date or will be handled by update logic.

      const currentDayForCheck = getCurrentDayName()
      const daySetting = registeredItem.days.find((d) => d.day === currentDayForCheck) // Use registeredItem for days

      if (!daySetting || !daySetting.active) {
        bellQueue.poll()
        continue
      }

      const nextTime24Hour =
        (registeredItem.time.period === 'pm' && registeredItem.time.hour !== 12 ? 12 : 0) +
        (registeredItem.time.period === 'am' && registeredItem.time.hour === 12 ? -12 : 0) +
        registeredItem.time.hour +
        registeredItem.time.minute / 60

      const currentTime24 = getCurrent24HourTime()

      if (nextTime24Hour < currentTime24) {
        bellQueue.poll()
        activeItemRegistry.delete(registeredItem.id!) // Time passed, remove from registry
        continue
      } else {
        currentlyScheduledBell = registeredItem // Schedule the version from registry
        mainWindow.webContents.send('schedule-updated', currentlyScheduledBell)

        const delay = (nextTime24Hour - currentTime24) * 60 * 60 * 1000
        console.log(
          `Backend: Scheduling: ${currentlyScheduledBell.label} to run in ${delay / 1000} seconds.`
        )

        executionTimerId = setTimeout(
          async () => {
            try {
              const itemFromQueueAtExecution = bellQueue.peek()
              const intendedItemToExecute = activeItemRegistry.get(nextBellToConsider.id!)

              if (!intendedItemToExecute || !intendedItemToExecute.switch_state) {
                // Item was deleted or made inactive from registry while timer was pending
                if (
                  itemFromQueueAtExecution &&
                  itemFromQueueAtExecution.id === nextBellToConsider.id
                ) {
                  bellQueue.poll() // Remove from physical queue if it's still there
                }
              } else {
                const currentDayAtExecution = getCurrentDayName()
                const daySettingAtExecution = intendedItemToExecute.days.find(
                  (d) => d.day === currentDayAtExecution
                )

                if (daySettingAtExecution && daySettingAtExecution.active) {
                  // Only poll if it's the one we intended to execute
                  if (
                    itemFromQueueAtExecution &&
                    itemFromQueueAtExecution.id === intendedItemToExecute.id
                  ) {
                    bellQueue.poll()
                  }
                  // activeItemRegistry.delete(intendedItemToExecute.id!); // Assuming single-shot, remove after execution
                  // If alarms are recurring (e.g. next day), do NOT delete from registry here.
                  // For this example, let's assume they are single-shot for the day.
                  // If not, the logic to re-add for next day needs to be elsewhere (e.g. after execution).

                  console.log(`Backend: Executing: ${intendedItemToExecute.label}`)
                  if (mainWindow) {
                    mainWindow.webContents.send('play-audio', intendedItemToExecute)

                    // Update the frontend that scheduled bell is no more scheduled
                    mainWindow.webContents.send('schedule-updated', null)
                  }
                } else {
                  // Day became inactive
                  if (
                    itemFromQueueAtExecution &&
                    itemFromQueueAtExecution.id === nextBellToConsider.id
                  ) {
                    bellQueue.poll()
                  }
                }
              }
            } catch (execError) {
              console.error('Backend: Error during scheduled execution: ', execError)
            } finally {
              currentlyScheduledBell = null
              executionTimerId = null
              isProcessing = false
              await internalProcessNextBell()
            }
          },
          delay > 0 ? delay : 0
        )
        return // Exit since a bell has been scheduled
      }
    }
    // If loop finishes, no future bell was scheduled.
    currentlyScheduledBell = null
    if (bellQueue.isEmpty() && activeItemRegistry.size === 0) {
      // Truly empty
      mainWindow.webContents.send('schedule-updated', null)
    } else if (!bellQueue.isEmpty()) {
      // If queue has items but none were schedulable, send its top.
      // Or, better, find next valid from registry and send that. For now, simple.
      mainWindow.webContents.send('schedule-updated', bellQueue.peek())
    } else {
      // Queue is empty but registry might have items for future days.
      // This case means nothing for *today* is schedulable.
      mainWindow.webContents.send('schedule-updated', null)
    }
  } catch (error) {
    console.error('Backend: Error in processNextBell:', error)
  } finally {
    if (!executionTimerId) {
      isProcessing = false
    }
  }
}

// --- Public API for the Scheduler ---

export function setSchedulerMainWindow(win: BrowserWindow): void {
  mainWindow = win
}

export function getCurrentlyScheduledBellInfo(): TimeData | null {
  return currentlyScheduledBell
}

export function getCurrentlyScheduledTabInfo(): {
  tabId: string | null
  tabName: string | null
} {
  return {
    tabId: currentScheduledTabId,
    tabName: currentScheduledTabName
  }
}

async function repopulateQueueFromRegistry(): Promise<void> {
  while (!bellQueue.isEmpty()) {
    bellQueue.poll()
  }
  // Re-add from the registry
  const allItemsFromRegistry = Array.from(activeItemRegistry.values())
  allItemsFromRegistry.forEach((item) => {
    if (item.switch_state) {
      // Only add active items to the physical queue
      bellQueue.add(item)
    }
  })
  console.log('Re Populated queue from registry')
}

export async function startScheduler(
  timeData: TimeData[],
  tabId: string,
  tabName: string
): Promise<void> {
  console.log('Backend: Starting scheduler with new data.')
  clearExistingTimerAndScheduledBellState()
  await internalClearQueue() // Clears bellQueue (by polling) and activeItemRegistry

  // --- Store the current tab info ---
  currentScheduledTabId = tabId
  currentScheduledTabName = tabName

  timeData.forEach((item) => {
    // Populate registry first
    if (item.id && item.switch_state) {
      activeItemRegistry.set(item.id, item)
      console.log('Adding', item.label)
    }
  })
  await repopulateQueueFromRegistry() // Then populate queue from registry

  isProcessing = false
  await internalProcessNextBell()
}

export async function addScheduledItem(newTimeDataItem: TimeData): Promise<void> {
  if (!newTimeDataItem.id) {
    console.error('Backend: Attempted to add item without ID.')
    return
  }
  console.log(`Backend: Adding item: ${newTimeDataItem.label}`)

  if (!newTimeDataItem.switch_state) {
    console.log(
      `Backend: Item ${newTimeDataItem.label} is not active, removing from registry if present.`
    )
    const wasPresent = activeItemRegistry.delete(newTimeDataItem.id)
    if (wasPresent) {
      // If it was in the registry, it might have been in queue
      clearExistingTimerAndScheduledBellState()
      await repopulateQueueFromRegistry() // Rebuild queue without it
      isProcessing = false
      await internalProcessNextBell()
    }
    return
  }
  clearExistingTimerAndScheduledBellState()
  activeItemRegistry.set(newTimeDataItem.id, newTimeDataItem) // Add/Update in registry

  await repopulateQueueFromRegistry() // Rebuild queue from registry

  isProcessing = false
  await internalProcessNextBell()
}

export async function updateScheduledItem(updatedTimeDataItem: TimeData): Promise<void> {
  if (!updatedTimeDataItem.id) {
    console.error('Backend: Attempted to update item without ID.')
    return
  }
  console.log(`Backend: Updating item: ${updatedTimeDataItem.label}`)

  clearExistingTimerAndScheduledBellState() // Always clear timer on update

  if (!updatedTimeDataItem.switch_state) {
    // Item is being turned off
    activeItemRegistry.delete(updatedTimeDataItem.id) // Remove from registry
  } else {
    // Item is active or being updated while active
    activeItemRegistry.set(updatedTimeDataItem.id, updatedTimeDataItem) // Update in registry
  }

  await repopulateQueueFromRegistry() // Rebuild queue from registry with latest states

  isProcessing = false
  await internalProcessNextBell()
}

export async function deleteScheduledItem(timeDataId: string): Promise<void> {
  console.log(`Backend: Deleting item with ID: ${timeDataId}`)

  clearExistingTimerAndScheduledBellState()
  const wasPresent = activeItemRegistry.delete(timeDataId) // Remove from our source of truth

  if (wasPresent) {
    await repopulateQueueFromRegistry() // Rebuild queue without the deleted item
  } else {
    console.warn(`Backend: Item with ID ${timeDataId} not found in registry for deletion.`)
  }

  isProcessing = false
  await internalProcessNextBell()
}

export async function stopScheduler(): Promise<void> {
  console.log('Backend: Stopping scheduler.')
  clearExistingTimerAndScheduledBellState()
  await internalClearQueue() // Clears bellQueue (by polling) and activeItemRegistry
  if (mainWindow) {
    mainWindow.webContents.send('schedule-updated', null)
  }
  isProcessing = false
}

// export async function deleteScheduledItemAlternative(timeDataId: string): Promise<void> {
//   console.log(`Backend: Deleting item (alternative) with ID: ${timeDataId}`)
//   const itemWasScheduled = currentlyScheduledBell && currentlyScheduledBell.id === timeDataId

//   const wasPresentInRegistry = activeItemRegistry.delete(timeDataId) // Remove from our source of truth

//   if (itemWasScheduled) {
//     // If the deleted item was the one actively scheduled with a timer
//     clearExistingTimerAndScheduledBellState()
//     isProcessing = false // Allow reprocessing to find the new next item
//     await internalProcessNextBell()
//   } else if (wasPresentInRegistry) {
//     // Item was in registry but not actively scheduled.
//     // The next run of internalProcessNextBell will eventually discard it from bellQueue
//     // if it reaches the top. No immediate queue rebuild.
//     // However, if the currentlyScheduledBell relied on this deleted item *not* being earlier,
//     // a re-process might be wise. For simplicity, let's assume this is okay.
//     // To be safer, or if 'schedule-updated' needs to be precise immediately:
//     // clearExistingTimerAndScheduledBellState(); // Ensure no stale timer
//     // isProcessing = false;
//     // await internalProcessNextBell(); // Re-evaluate
//     console.log(
//       `Backend: Item ${timeDataId} removed from registry. Will be discarded from queue by scheduler if it surfaces.`
//     )
//   }
// }
