import { getMusicFiles } from '@renderer/Apis/audio'
import { notification } from '@renderer/Apis/other'
import handBell from '@renderer/assets/Handbell.mp3'
import { TimeData } from '@shared/type'
import { toast } from 'sonner'

/**
 * Plays an audio file from the given local file path.
 *
 * @param filePath - The absolute path to the audio file.
 */
export const playAudio = async (timeData: TimeData): Promise<void> => {
  const { music_file_name } = timeData
  console.log(`Attempting to play audio file: ${music_file_name}`)

  try {
    const audioFilesPaths = await getMusicFiles()
    console.log('audioFilesPaths', audioFilesPaths)

    const file = audioFilesPaths.filter((file) => file.name === music_file_name)
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
        toast.info(`Playing the Bell: ${music_file_name}`)
        audio.onended = (): void => {
          console.log('Playback finished.')
          notification.success(timeData)
          toast.success(`Successfully Played the Bell: ${music_file_name}`)
        }
      })
      .catch((error) => {
        console.error(`Error playing audio file [${filePath}]:`, error)
        notification.error(timeData)
        toast.success(`Failed to Play the Bell: ${music_file_name}`)
      })
  } catch (error) {
    console.error(`Error creating audio object for file [${music_file_name}]:`, error)
  }
}
