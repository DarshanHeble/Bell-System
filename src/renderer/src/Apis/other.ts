import { TimeData } from '@shared/type'

export const checkUserIsVerified = async (): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('checkUserIsVerified')
}

export const notification = {
  success: async (timeData: TimeData): Promise<void> => {
    return await window.electron.ipcRenderer.invoke('notification:success', timeData)
  },

  error: async (timeData: TimeData): Promise<void> => {
    return await window.electron.ipcRenderer.invoke('notification:error', timeData)
  }
}
