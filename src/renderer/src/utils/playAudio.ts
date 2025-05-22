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

    if (filePath) {
      console.log('Initialized User audio file')
      play(timeData, filePath)
    } else {
      console.log('Initialized default audio file')
      play(timeData, filePath, true)
    }
  } catch (error) {
    console.error(`Error creating audio object for file [${music_file_name}]:`, error)
    const defaultAudio = new Audio(handBell)
    try {
      await defaultAudio.play()
      notification.success(timeData)
      toast.success(`Successfully Played the Default Bell: Handbell`)
    } catch (err) {
      console.error(`Failed to play the default audio [${handBell}]:`, err)
      notification.error(timeData)
      toast.error(`Failed to Play Any Bell: ${music_file_name}`)
    }
  }
}

async function play(
  timeData: TimeData,
  filePath: string,
  isDefault: boolean = false
): Promise<void> {
  const userAudio: HTMLAudioElement = new Audio(filePath)
  const { music_file_name } = timeData

  try {
    await userAudio.play()
    console.log(`Successfully started playing: ${filePath}`)
    toast.info(`Playing the Bell: ${isDefault ? 'Default Bell' : music_file_name}`)

    userAudio.onended = (): void => {
      console.log('Playback finished.')
      notification.success(timeData)
      toast.success(`Successfully Played the Bell: ${isDefault ? 'Default Bell' : music_file_name}`)
    }
  } catch (error) {
    if (!isDefault) {
      console.error(`Error playing user-specified audio [${filePath}]:`, error)
      console.log('Attempting to play default audio...')
      play(timeData, handBell, true) // Fallback to default audio
    } else {
      console.error(`Error playing default audio [${handBell}]:`, error)
      notification.error(timeData)
      toast.error(`Failed to Play the Bell: ${music_file_name}`)
    }
  }
}
