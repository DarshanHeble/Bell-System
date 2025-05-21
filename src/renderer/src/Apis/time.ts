import { TimeData } from '@shared/type'

export const addTime = async (_id: string, newTimeData: TimeData): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('addTimeData', _id, newTimeData)
}

export const deleteTime = async (_id: string, newTimeData: TimeData): Promise<boolean> => {
  return await window.electron.ipcRenderer.invoke('deleteTimeData', _id, newTimeData)
}
