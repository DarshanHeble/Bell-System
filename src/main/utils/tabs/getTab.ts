import { Tab } from '@shared/type'
import { pdbBell } from '../../pouchdb'
import { sortTimeData } from '@shared/utils'

const getTab = async (_id: string): Promise<Tab | null> => {
  try {
    const tab = await pdbBell.get<Tab>(_id)

    if (tab && Array.isArray(tab.data)) {
      tab.data = sortTimeData(tab.data)
    }

    return tab
  } catch (error) {
    console.error('Error getting tab:', error)
    return null
  }
}

export default getTab
