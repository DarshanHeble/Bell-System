import { AudioContext } from 'node-web-audio-api'
import fs from 'fs/promises'
import path from 'path'
import { projectMusicDirPath } from '@shared/constant'
import { Notification } from 'electron'
import { TimeData } from '@shared/type'

const audioContext = new AudioContext()

const playAudio = async (
  audioFileName: string,
  tab_name: string,
  timedata: TimeData
): Promise<void> => {
  try {
    const audioFilePath = path.join(projectMusicDirPath, audioFileName)
    const audioBuffer = await loadAudioFile(audioFilePath)

    const audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioSource.connect(audioContext.destination)

    const { hour, minute, period } = timedata.time

    // Use a single promise-based event listener
    return new Promise<void>((resolve) => {
      audioSource.onended = (): void => {
        console.log('Audio played successfully.')
        resolve()
      }
      // play audio
      audioSource.start()
      new Notification({
        title: 'Bell System',
        subtitle: tab_name,
        body: `Bell On: ${hour}: ${minute} ${period}`,
        icon: path.join(__dirname, '../../../resources/icon.png')
      }).show()
    })
  } catch (err) {
    console.error('Error playing audio:', err)
    throw err // Simply throw the error, no need for explicit Promise rejection
  }
}

const loadAudioFile = async (filePath: string): Promise<AudioBuffer> => {
  try {
    const data = await fs.readFile(filePath)
    return await audioContext.decodeAudioData(data.buffer)
  } catch (err) {
    console.error('Error loading audio file:', err)
    throw err
  }
}

export default playAudio
