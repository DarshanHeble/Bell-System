import { Time } from '@shared/type'

export const getCurrentTime = (): Time => {
  const now = new Date()
  let hour = now.getHours()
  const minute = now.getMinutes()
  const isPm = hour >= 12

  if (hour > 12) {
    hour -= 12
  } else if (hour === 0) {
    hour = 12
  }

  return {
    hour: hour,
    minute: minute,
    period: isPm ? 'pm' : 'am'
  }
}

export const capitalizeString = (str: string): string => {
  if (!str) return ''
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase()
}
