export const setActiveTab = async (
  activeTabId: string,
  inActiveTabId: string
): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('setActiveTab', activeTabId, inActiveTabId)
}
