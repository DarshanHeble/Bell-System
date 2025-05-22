import { TimeData } from '@shared/type'
import { Notification } from 'electron'
import path from 'path'
import { getCurrentlyScheduledTabInfo } from '../scheduler/bellScheduler'

export const notification = {
  success: (timeData: TimeData): void => {
    const { hour, minute, period } = timeData.time

    const { tabName } = getCurrentlyScheduledTabInfo()

    new Notification({
      title: 'Bell System',
      // subtitle: label,
      body: `Tab Name: ${tabName}\nSuccessfully Played Bell On: ${hour}:${minute.toString().padStart(2, '0')} ${period}`,
      icon: path.join(__dirname, '../../resources/icon.png')
    }).show()
  },

  error: (timeData: TimeData): void => {
    const { hour, minute, period } = timeData.time
    const { tabName } = getCurrentlyScheduledTabInfo()

    new Notification({
      title: 'Bell System',
      // subtitle: label,
      body: `Tab Name: ${tabName}\nFailed to Play Bell On: ${hour}:${minute.toString().padStart(2, '0')} ${period}`,
      icon: path.join(__dirname, '../../resources/icon.png')
    }).show()
  }
}
