import { TimeData } from '@shared/type'

export async function startScheduler(
  timeData: TimeData[],
  tabId: string,
  tabName: string
): Promise<void> {
  return await window.electron.ipcRenderer.invoke('scheduler:start', timeData, tabId, tabName)
}

export async function addScheduledItem(timeData: TimeData): Promise<void> {
  return await window.electron.ipcRenderer.invoke('scheduler:add-item', timeData)
}

export async function deleteScheduledItem(timeId: string): Promise<void> {
  return await window.electron.ipcRenderer.invoke('scheduler:delete-item', timeId)
}

export async function updateScheduledItem(timeData: TimeData): Promise<void> {
  return await window.electron.ipcRenderer.invoke('scheduler:add-item', timeData)
}

export async function stopScheduler(): Promise<void> {
  return await window.electron.ipcRenderer.invoke('scheduler:stop')
}

export async function getCurrentlyScheduledBellInfo(): Promise<TimeData> {
  return await window.electron.ipcRenderer.invoke('scheduler:get-info')
}
