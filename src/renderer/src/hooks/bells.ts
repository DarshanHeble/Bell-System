import { addTime, getTab } from '@renderer/api'
import { Tab, TimeData } from '@shared/type'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query'

export const useBells = (tabId: string): UseQueryResult<Tab | undefined, Error> => {
  return useQuery({
    queryKey: ['bellTab', tabId],
    queryFn: async () => {
      if (!tabId) return undefined

      const bells = getTab(tabId)
      return bells
    }
  })
}

export const useAddBell = (tabId: string): UseMutationResult<boolean, Error, TimeData, unknown> => {
  const queryClient = useQueryClient()

  return useMutation<boolean, Error, TimeData>({
    mutationFn: async (newTime) => {
      if (!tabId) throw new Error('Tab ID is required')
      return await addTime(tabId, newTime)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bellTab', tabId] })
    }
  })
}

// export const useDeleteBell = (tabId?: string) => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (bellId: string) => {
//       if (!tabId) throw new Error('Tab ID is required')
//       return await deleteBell(tabId, bellId)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['bellTab', tabId])
//     }
//   })
// }

// export const useUpdateBell = (tabId?: string) => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async ({ bellId, updatedData }: { bellId: string; updatedData: any }) => {
//       if (!tabId) throw new Error('Tab ID is required')
//       return await updateBell(tabId, bellId, updatedData)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['bellTab', tabId])
//     }
//   })
// }
