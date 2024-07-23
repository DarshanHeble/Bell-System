import { Tab } from '@shared/type'
import pdb from '../pouchdb'

const addTab = async (tab: Tab): Promise<string | null> => {
  try {
    // Check if the document with the given tab_id already exists
    await pdb.get(tab.tab_id).catch((err) => {
      if (err.status === 404) {
        return null // Document does not exist
      }
      throw err // Other errors
    })

    const responce = await pdb.post({
      ...tab
    })

    console.log('Tab added or updated successfully')
    return responce.id
  } catch (error) {
    console.error('Error adding or updating tab:', error)
    return null
  }
}

export default addTab
