import {
  AUDIO_EXTENSIONS_REGEX,
  CUSTOM_PROTOCOL_SCHEME,
  projectMusicDirPath
} from '@shared/constant'
import { AudioFile } from '@shared/type'
import { getMimeType } from '@shared/utils'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

async function getMusicFiles(): Promise<AudioFile[]> {
  try {
    // Ensure the directory exists
    if (!existsSync(projectMusicDirPath)) {
      console.log('No audio file ')

      return []
    }

    // Read the directory contents
    const dirents = readdirSync(projectMusicDirPath, { withFileTypes: true })
    // console.log('Got this files', files)

    // Filter for audio files only
    const audioFiles = dirents
      .filter((dirent) => dirent.isFile() && AUDIO_EXTENSIONS_REGEX.test(dirent.name))
      .map((dirent) => {
        const rawFilePath = join(projectMusicDirPath, dirent.name)
        return {
          name: dirent.name,
          // Construct the custom protocol URL directly here
          path: `${CUSTOM_PROTOCOL_SCHEME}://${rawFilePath.replace(/\\/g, '/')}`,
          mimeType: getMimeType(dirent.name)
        }
      }) satisfies AudioFile[]

    // console.log(audioFiles)

    return audioFiles
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default getMusicFiles
