import { audioFilePath } from '@shared/constant'
import { dialog } from 'electron'
import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const createAudioFile = async (): Promise<string | null> => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }]
    })

    if (result.canceled) {
      return null
    } else {
      const filePath = result.filePaths[0]
      const fileName = path.basename(filePath)
      const destinationPath = path.join(audioFilePath, path.basename(filePath))

      // Ensure the music directory exists
      mkdirSync(audioFilePath, { recursive: true })

      // Copy the file
      copyFileSync(filePath, destinationPath)

      return fileName
    }
  } catch (error) {
    console.error('Error selecting and copying music file:', error)
    return null
  }
}

export default createAudioFile
