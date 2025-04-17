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
