import { v4 } from 'uuid'
import getAllTabs from './getAllTabs'

const migrateData = async (): Promise<void> => {
  try {
    const tabs = await getAllTabs()

    for (const tab of tabs) {
      tab.data.map((timeData) => {
        if (!timeData.id) {
          return { ...timeData, id: v4() } // Add id if id is not present
        }
        return timeData
      })
    }
    console.info('Migration completed')
  } catch (error) {
    console.error('Migration failed', error)
  }
}

export default migrateData
