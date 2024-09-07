import { Tab, TabWithRev, TimeData } from '@shared/type'
import { pdbBell } from '../pouchdb'

const updateSwitch = async (
  tab_id: string,
  dataIndex: number,
  switchState: boolean
): Promise<void> => {
  try {
    console.log(tab_id, dataIndex, switchState)
    const existingTab = await pdbBell.get(tab_id)

    if (existingTab) {
      const tab = existingTab as unknown as TabWithRev // typecast to tab with _rev type

      const updatedAlarmData: TimeData = { ...tab.data[dataIndex], switch_state: switchState }

      const updatedData: TimeData[] = [...tab.data] // Get full timeData array
      updatedData[dataIndex] = updatedAlarmData //update the specific alarm data

      const updatedTab: Tab = {
        ...tab,
        data: updatedData
      }

      pdbBell.put(updatedTab)
      console.log('tab updated successfully')
    } else {
      console.error('Tab Not Found')
    }
  } catch (error) {
    console.log(error)
  }
}
export default updateSwitch
