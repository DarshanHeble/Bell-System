import { Tab } from '@shared/type'
import { pdbBell } from '../pouchdb'

// Function to get all data from PouchDB
export const getAllTabs = async (): Promise<Tab[]> => {
  try {
    const result = await pdbBell.allDocs({ include_docs: true })
    // Extract the documents from the result and cast them to Tab[]
    const tabs: Tab[] = result.rows.map((row) => row.doc as unknown as Tab)
    console.log(tabs)

    return tabs
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}

export default getAllTabs
