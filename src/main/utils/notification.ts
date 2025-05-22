import { TimeData } from '@shared/type'
import { Notification } from 'electron'
import path from 'path'

export const notification = {
  success: (timeData: TimeData): void => {
    const { label, time } = timeData

    new Notification({
      title: 'Bell System',
      subtitle: label,
      body: `Successfully Played Bell On: ${time.hour}: ${time.minute.toString().padStart(2, '0')} ${time.period}`,
      icon: path.join(__dirname, '../../resources/icon.png')
    }).show()
  },

  error: (timeData: TimeData): void => {
    const { label, time } = timeData

    new Notification({
      title: 'Bell System',
      subtitle: label,
      body: `Failed to Play Bell On: ${time.hour}: ${time.minute.toString().padStart(2, '0')} ${time.period}`,
      icon: path.join(__dirname, '../../resources/icon.png')
    }).show()
  }
}
