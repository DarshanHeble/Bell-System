import { Tab } from '@shared/type'
import { pdbBell } from '../../pouchdb'

/**
 * Update the active state of 2 tabs in the database
 * @param activeTabId - The ID of the tab to be set as active
 * @param inActiveTabId - The ID of the tab to be set as inactive
 * @returns Promise<boolean> - Returns true if successfully, else false for error
 */
const setActiveTab = async (activeTabId: string, inActiveTabId: string): Promise<boolean> => {
  try {
    const [activeTab, inActiveTab] = await Promise.all([
      pdbBell.get<Tab>(activeTabId),
      pdbBell.get<Tab>(inActiveTabId)
    ])

    // Update the active state
    activeTab.isActive = true
    inActiveTab.isActive = false

    await Promise.all([pdbBell.put(activeTab), pdbBell.put(inActiveTab)])

    return true
  } catch (error) {
    console.error('An error occurred while setting active tab state in database')
    return false
  }
}

export default setActiveTab
