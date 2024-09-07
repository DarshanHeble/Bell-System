import { Tab } from './type'

export const timeData: Tab[] = [
  {
    _id: 'jm,,m',
    tab_name: 'Classes',
    tab_id: 'Classes',
    data: [
      {
        time: { hour: 7, minute: 9, period: 'pm' },
        label: 'hello',
        music_file_name: 'Bell.mp3',
        days: [
          { day: 'S', active: false },
          { day: 'M', active: true },
          { day: 'T', active: true },
          { day: 'W', active: true },
          { day: 'T', active: true },
          { day: 'F', active: true },
          { day: 'S', active: true }
        ],
        switch_state: false
      },
      {
        time: { hour: 7, minute: 8, period: 'pm' },
        label: 'hello',
        music_file_name: 'Bell.mp3',
        days: [
          { day: 'S', active: false },
          { day: 'M', active: true },
          { day: 'T', active: true },
          { day: 'W', active: true },
          { day: 'T', active: true },
          { day: 'F', active: true },
          { day: 'S', active: true }
        ],
        switch_state: true
      }
    ]
  },
  {
    _id: 'jkjj',
    tab_name: 'exam',
    tab_id: 'exam',
    data: [
      {
        time: { hour: 7, minute: 9, period: 'pm' },
        label: 'hello1',
        music_file_name: 'Bell.mp3',
        days: [
          { day: 'S', active: false },
          { day: 'M', active: true },
          { day: 'T', active: true },
          { day: 'W', active: true },
          { day: 'T', active: true },
          { day: 'F', active: true },
          { day: 'S', active: true }
        ],
        switch_state: true
      }
    ]
  }
]

// export const timedata: Promise<Tab[]> = window.electron.ipcRenderer.invoke('getTabs')
// console.log('timedata', timedata)
