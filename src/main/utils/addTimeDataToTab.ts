import { Tab, TimeData } from '@shared/type'
import { pdbBell } from '../pouchdb'

// Function to add TimeData to a specific Tab
export const addTimeDataToTab = async (_id: string, timeData: TimeData): Promise<void> => {
  try {
    // Fetch the existing Tab document
    const existingDoc = await pdbBell.get(_id)

    if (existingDoc) {
      // Cast to Tab type
      const tab = existingDoc as unknown as Tab

      // Update the data field
      const updatedData = [...tab.data, timeData]

      // Prepare the updated document
      const updatedDoc = {
        ...tab,
        data: updatedData,
        _rev: existingDoc._rev // Ensure to include the revision ID for the update
      }

      // Save the updated document back to PouchDB
      await pdbBell.put(updatedDoc)
      //   console.log(updatedDoc)

      console.log('TimeData added successfully')
    } else {
      console.error('Tab not found')
    }
  } catch (error) {
    console.error('Error adding TimeData to tab:', error)
  }
}

export default addTimeDataToTab
