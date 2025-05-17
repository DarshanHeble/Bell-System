import { getMusicFiles } from '@renderer/api'
import handBell from '@renderer/assets/Handbell.mp3'

/**
 * Plays an audio file from the given local file path.
 *
 * @param filePath - The absolute path to the audio file.
 */
export const playAudio = async (fileName: string): Promise<void> => {
  console.log(`Attempting to play audio file: ${fileName}`)

  try {
    const audioFilesPaths = await getMusicFiles()
    console.log('audioFilesPaths', audioFilesPaths)

    const file = audioFilesPaths.filter((file) => file.name === fileName)
    const filePath = file[0].path

    let audio: HTMLAudioElement

    if (filePath) {
      audio = new Audio(filePath)
      console.log('Initialized User audio file')
    } else {
      audio = new Audio(handBell)
      console.log('Initialized default audio file')
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
