/**
 * Plays an audio file from the given local file path.
 *
 * @param filePath - The absolute path to the audio file.
 * (Ensure this path is accessible by the renderer process).
 */

const playAudio = (filePath: string): void => {
  console.log(`Attempting to play audio file: ${filePath}`)

  try {
    const audio = new Audio(filePath)

    audio
      .play()
      .then(() => {
        console.log(`Successfully started playing: ${filePath}`)
        // You could potentially add event listeners here for 'ended', 'error', etc.
        audio.onended = (): void => console.log('Playback finished.')
      })
      .catch((error) => {
        console.error(`Error playing audio file [${filePath}]:`, error)
      })
  } catch (error) {
    console.error(`Error creating audio object for file [${filePath}]:`, error)
  }
}

export default playAudio
