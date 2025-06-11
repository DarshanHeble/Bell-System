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

// Utility to get the current time in 24-hour format for comparison
export function getCurrent24HourTime(): number {
  const now = new Date()
  const hour = now.getHours() // 0-23
  const minute = now.getMinutes()
  const second = now.getSeconds()
  return hour + minute / 60 + second / 3600
}

export function getCurrentDayName(): string {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const now = new Date()
  return daysOfWeek[now.getDay()] // getDay() returns 0 for Sunday, 1 for Monday, etc.
}

export function getMimeType(fileName: string): string {
  const extension = fileName.slice(fileName.lastIndexOf('.'))
  switch (extension.toLowerCase()) {
    case '.mp3':
      return 'audio/mpeg'
    case '.ogg':
      return 'audio/ogg'
    case '.wav':
      return 'audio/wav'
    case '.aac':
      return 'audio/aac'
    default:
      return 'application/octet-stream' // Default binary type
  }
}
