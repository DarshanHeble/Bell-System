import { projectMusicDirPath } from '@shared/constant'
import { dialog } from 'electron'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const selectAudioFile = async (): Promise<string | null> => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }]
    })

    if (result.canceled) {
      console.warn('User cancelled the file selection operation.')
      return 'cancel'
    }

    const filePath = result.filePaths[0]
    const fileName = path.basename(filePath)
    const destinationPath = path.join(projectMusicDirPath, fileName)

    // Ensure the music directory exists
    mkdirSync(projectMusicDirPath, { recursive: true })

    // Check if the file already exists
    if (existsSync(destinationPath)) {
      console.warn(`File "${fileName}" already exists. Skipping copy.`)
      return 'duplicate'
    }

    // Copy the file
    copyFileSync(filePath, destinationPath)
    return fileName
  } catch (error) {
    console.error('Unexpected error while selecting or copying the music file:', error)
    throw new Error('Failed to select or copy the audio file. Please try again.')
  }
}

export default selectAudioFile
