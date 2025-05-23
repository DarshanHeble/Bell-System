import { getTab } from '@renderer/Apis/tab'
import { addTime, deleteTime } from '@renderer/Apis/time'
import { Tab, TimeData } from '@shared/type'
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query'

export const useBells = (tabId?: string): UseQueryResult<Tab | undefined, Error> => {
  return useQuery({
    queryKey: ['bellTab', tabId],
    queryFn: async () => {
      if (!tabId) return undefined

      const bells = getTab(tabId)
      return bells
    }
  })
}

export const useAddBell = (
  tabId?: string
): UseMutationResult<boolean, Error, TimeData, unknown> => {
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

export const useDeleteBell = (
  tabId?: string
): UseMutationResult<
  boolean,
  Error,
  TimeData,
  {
    previousData: Tab | undefined
  }
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (timeData: TimeData) => {
      if (!tabId) throw new Error('Tab ID is required')
      return await deleteTime(tabId, timeData)
    },
    onMutate: async (deletedTimeData) => {
      // Cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ['bellTab', tabId] })

      // Get current data
      const previousData = queryClient.getQueryData<Tab>(['bellTab', tabId])

      // Optimistically update the data
      queryClient.setQueryData<Tab | undefined>(['bellTab', tabId], (old) => {
        if (!old) return old // No data to update
        return {
          ...old,
          data: old.data.filter((item) => item.id !== deletedTimeData.id) // Remove the deleted TimeData
        }
      })

      return { previousData }
    },
    onError: (_, __, context) => {
      // Rollback to the previous state if the mutation fails
      if (tabId && context?.previousData) {
        queryClient.setQueryData(['bellTab', tabId], context.previousData)
      }
    }
    // onSettled: () => {
    //   // Refetch the data from the server to ensure consistency
    //   if (tabId) {
    //     queryClient.invalidateQueries({ queryKey: ['bellTab', tabId] })
    //   }
    // }
  })
}

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
