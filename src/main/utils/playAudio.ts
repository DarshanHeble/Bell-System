import { AudioContext } from 'node-web-audio-api'
import fs from 'fs/promises'
import path from 'path'
import { projectMusicDirPath } from '@shared/constant'

const audioContext = new AudioContext()

const playAudio = async (audioFileName: string): Promise<void> => {
  try {
    const audioFilePath = path.join(projectMusicDirPath, audioFileName)

    const audioBuffer = await loadAudioFile(audioFilePath)
    const audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioSource.connect(audioContext.destination)

    return new Promise<void>((resolve, reject) => {
      audioSource.onended = (): void => {
        console.log('Audio played successfully.')
        resolve()
      }

      audioSource.start()

      // In case of any error, you can add error handling as well
      audioSource.onended = (event): void => {
        if (event.type === 'ended') {
          resolve()
        } else {
          reject(new Error('Audio playback failed'))
        }
      }
    })
  } catch (err) {
    console.error('Error playing audio:', err)
    return Promise.reject(err)
  }
}

const loadAudioFile = async (filePath: string): Promise<AudioBuffer> => {
  const data = await fs.readFile(filePath)
  return audioContext.decodeAudioData(data.buffer)
}

export default playAudio
