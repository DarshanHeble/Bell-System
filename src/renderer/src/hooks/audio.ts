import { getMusicFiles } from '@renderer/api'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

export const useAudio = (): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: ['audio'],
    queryFn: getMusicFiles
  })
}
