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
  id?: string
  time: Time
  label: string
  music_file_name: string
  days: Day[]
  switch_state: boolean
}

export type Tab = {
  _id: string
  _rev?: string
  tab_name: string
  isActive?: boolean
  tab_id: string // This is not used anyone, just kept to be safe
  data: TimeData[]
}

export type activeTabType = {
  index: number
  name: string
}

export type TabWithOut_Id = Omit<Tab, '_id'>
export type TabWithOutTimeData = Omit<Tab, 'data'>

export type TabWithRev = Tab & { _rev: string }

export type OtherDataType = {
  _id: string
  _rev: string
  isVerified: boolean
}

export type AudioFile = {
  name: string
  path: string
}
