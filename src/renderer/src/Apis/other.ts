export const checkUserIsVerified = async (): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('checkUserIsVerified')
}
