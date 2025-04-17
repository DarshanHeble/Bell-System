import { projectMusicDirPath } from '@shared/constant'
import { unlink } from 'node:fs'
import path from 'path'

async function deleteAudioFile(fileName: string): Promise<boolean> {
  try {
    const filePath = path.join(projectMusicDirPath, fileName)
    unlink(filePath, (err) => {
      if (err) return false
      return true
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export default deleteAudioFile
