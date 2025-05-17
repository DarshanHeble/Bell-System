import { getMusicFiles } from '@renderer/api'
import { AudioFile } from '@shared/type'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

export const useAudio = (): UseQueryResult<AudioFile[], Error> => {
  return useQuery({
    queryKey: ['audio'],
    queryFn: getMusicFiles
  })
}
