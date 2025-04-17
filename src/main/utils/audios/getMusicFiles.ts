import { projectMusicDirPath } from '@shared/constant'
import { existsSync, readdirSync } from 'node:fs'

async function getMusicFiles(): Promise<string[]> {
  try {
    // Ensure the directory exists
    if (!existsSync(projectMusicDirPath)) {
      return []
    }

    // Read the directory contents
    const files = readdirSync(projectMusicDirPath)
    // console.log('Got this files', files)

    // Filter for audio files only
    const audioFiles = files.filter((file) => /\.(mp3|wav|ogg)$/i.test(file))
    // console.log('filtered files', audioFiles)

    return audioFiles
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default getMusicFiles
