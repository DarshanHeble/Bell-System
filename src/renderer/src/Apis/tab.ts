import { Tab, TabWithOutTimeData } from '@shared/type'

export const fetchTabs = async (): Promise<TabWithOutTimeData[]> => {
  // const fetchedTabs: Tab[] = await window.electron.ipcRenderer.invoke('getTabs')
  return await window.electron.ipcRenderer.invoke('getAllTabWithOutTimeData')
}

export const getTab = async (tabId: string): Promise<Tab> => {
  // const fetchedTabs: Tab[] = await window.electron.ipcRenderer.invoke('getTabs')
  return await window.electron.ipcRenderer.invoke('getTab', tabId)
}

export const setActiveTab = async (
  activeTabId: string,
  inActiveTabId: string
): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('setActiveTab', activeTabId, inActiveTabId)
}

export const updateActiveTab = async (
  activeTabId: string,
  inActiveTabId: string
): Promise<void> => {
  return window.electron.ipcRenderer.invoke('setActiveTab', activeTabId, inActiveTabId)
}
