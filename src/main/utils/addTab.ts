import { TabWithOut_Id } from '@shared/type'
import { pdbBell } from '../pouchdb'

const addTab = async (tab: TabWithOut_Id): Promise<string | null> => {
  console.log(tab)

  try {
    const response = await pdbBell.post({
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
