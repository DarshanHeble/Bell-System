import { Tab } from '@shared/type'
import { pdbBell } from '../../pouchdb'
import { sortTimeData } from '@shared/utils'

// Function to get all data from PouchDB
export const getAllTabs = async (): Promise<Tab[]> => {
  try {
    const result = await pdbBell.allDocs({ include_docs: true })
    // Extract the documents from the result and cast them to Tab[]
    const tabs: Tab[] = result.rows.map((row) => {
      const tab = row.doc as unknown as Tab

      // Ensure tab.data is an array before sorting
      if (Array.isArray(tab.data)) {
        tab.data = sortTimeData(tab.data)
      } else {
        console.warn(`Data for tab ${tab.tab_name} is not an array or is undefined:`, tab.data)
        tab.data = [] // Assign an empty array if undefined or invalid
      }

      return tab
    })
    console.log(tabs)

    return tabs
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}

export default getAllTabs
