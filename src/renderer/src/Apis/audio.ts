import { AudioFile } from '@shared/type'

export const getMusicFiles = async (): Promise<AudioFile[]> => {
  return await window.electron.ipcRenderer.invoke('get-music-files')
}

export const createMusicFiles = async (): Promise<AudioFile[]> => {
  return await window.electron.ipcRenderer.invoke('createAudioFile')
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
