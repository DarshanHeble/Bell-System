import { TabWithOutTimeData } from '@shared/type'
import { pdbBell } from '../../pouchdb'

async function getAllTabsWithoutTimeData(): Promise<TabWithOutTimeData> {
  try {
    const result = await pdbBell.find({
      selector: { tab_name: { $exists: true } }, // Replace with your condition
      fields: ['_id', '_rev', 'tab_name', 'tab_id', 'isActive'] // Exclude `data`
    })

    const data = result.docs as unknown as TabWithOutTimeData
    return data
  } catch (error) {
    console.error('Error fetching tabs without time data:', error)
    throw error
  }
}

export default getAllTabsWithoutTimeData
