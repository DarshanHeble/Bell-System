import { Tab, TimeData } from '@shared/type'

export const setActiveTab = async (
  activeTabId: string,
  inActiveTabId: string
): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('setActiveTab', activeTabId, inActiveTabId)
}

export const deleteAudioFile = async (fileName: string): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('deleteAudioFile', fileName)
}

export const renameAudioFile = async (
  oldFileName: string,
  newFileName: string
): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('renameAudioFile', oldFileName, newFileName)
}

export const fetchTabs = async (): Promise<Tab[]> => {
  // const fetchedTabs: Tab[] = await window.electron.ipcRenderer.invoke('getTabs')
  return await window.electron.ipcRenderer.invoke('getAllTabWithOutTimeData')
}

export const getTab = async (tabId: string): Promise<Tab> => {
  // const fetchedTabs: Tab[] = await window.electron.ipcRenderer.invoke('getTabs')
  return await window.electron.ipcRenderer.invoke('getTab', tabId)
}

export const updateActiveTab = async (
  activeTabId: string,
  inActiveTabId: string
): Promise<void> => {
  return window.electron.ipcRenderer.invoke('setActiveTab', activeTabId, inActiveTabId)
}

export const checkUserIsVerified = async (): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('checkUserIsVerified')
}

export const addTime = async (_id: string, newTimeData: TimeData): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('addTimeData', _id, newTimeData)
}
