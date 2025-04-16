import { TimeData } from './type'

// Function to sort an array of TimeData by time
export const sortTimeData = (data: TimeData[]): TimeData[] => {
  return data.sort((a, b) => {
    const timeA = convertToMinutes(a.time.hour, a.time.minute, a.time.period)
    const timeB = convertToMinutes(b.time.hour, b.time.minute, b.time.period)
    return timeA - timeB
  })
}

// Helper to convert Time to total minutes since midnight
const convertToMinutes = (hour: number, minute: number, period: 'am' | 'pm'): number => {
  const totalHour = period === 'pm' ? (hour % 12) + 12 : hour % 12
  return totalHour * 60 + minute
}

export const capitalizeString = (str: string): string => {
  if (!str) return ''
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase()
}
