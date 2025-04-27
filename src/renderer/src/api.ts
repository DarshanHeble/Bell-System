import { Tab } from '@shared/type'

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

export const updateActiveTab = async (
  activeTabId: string,
  inActiveTabId: string
): Promise<void> => {
  return window.electron.ipcRenderer.invoke('setActiveTab', activeTabId, inActiveTabId)
}
