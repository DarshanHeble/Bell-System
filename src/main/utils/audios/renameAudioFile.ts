import { projectMusicDirPath } from '@shared/constant'
import { rename } from 'node:fs'
import path from 'path'

async function renameAudioFile(oldFileName: string, newFileName: string): Promise<boolean> {
  try {
    const oldFilePath = path.join(projectMusicDirPath, oldFileName)
    const newFilePath = path.join(projectMusicDirPath, newFileName)

    rename(oldFilePath, newFilePath, (err) => {
      if (err) return false
      return true
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export default renameAudioFile
