import { getMusicFiles } from '@renderer/api'

/**
 * Fetches the full path of an audio file given its filename.
 *
 * @param fileName - The name of the audio file to search for.
 * @param filePaths - An array of absolute paths to audio files.
 * @returns The full path of the audio file, or `null` if not found.
 */
const getFilePathByName = (fileName: string, filePaths: string[]): string | null => {
  const filePath = filePaths.find((path) => path.endsWith(fileName))
  if (!filePath) {
    console.warn(`Audio file [${fileName}] not found in the provided paths.`)
    return null
  }
  return filePath
}

/**
 * Plays an audio file from the given local file path.
 *
 * @param filePath - The absolute path to the audio file.
 */
export const playAudio = async (fileName: string): Promise<void> => {
  console.log(`Attempting to play audio file: ${fileName}`)

  try {
    const audioFilesPaths = await getMusicFiles()
    const filePath = getFilePathByName(fileName, audioFilesPaths)

    let audio: HTMLAudioElement

    if (filePath) {
      audio = new Audio(filePath)
    } else {
      audio = new Audio('/src/renderer/src/assets/Handbell.mp3')
    }

    audio
      .play()
      .then(() => {
        console.log(`Successfully started playing: ${filePath}`)
        audio.onended = (): void => console.log('Playback finished.')
      })
      .catch((error) => {
        console.error(`Error playing audio file [${filePath}]:`, error)
      })
  } catch (error) {
    console.error(`Error creating audio object for file [${fileName}]:`, error)
  }
}
