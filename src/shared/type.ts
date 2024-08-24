export type Time = {
  hour: number
  minute: number
  period: 'am' | 'pm'
}

export type Day = {
  day: string
  active: boolean
}

export type TimeData = {
  time: Time
  label: string
  music_file_name: string
  days: Day[]
  switch_state: boolean
}

export type Tab = {
  _id: string
  // _rev: string
  tab_name: string
  tab_id: string
  data: TimeData[]
}

export type activeTabType = {
  index: number
  name: string
}

export type TabWithOut_Id = Omit<Tab, '_id'>

export type TabWithRev = Tab & { _rev: string }
