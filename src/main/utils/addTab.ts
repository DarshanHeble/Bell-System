import { TabWithOut_Id } from '@shared/type'
import pdb from '../pouchdb'

const addTab = async (tab: TabWithOut_Id): Promise<string | null> => {
  console.log(tab)

  try {
    const response = await pdb.post({
      ...tab
    })

    console.log('Tab added or updated successfully')
    return response.id
  } catch (error) {
    console.error('Error adding or updating tab:', error)
    return null
  }
}

export default addTab
