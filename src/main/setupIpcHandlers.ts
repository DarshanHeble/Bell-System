import { ipcMain } from 'electron'
import { Tab, TimeData, OtherDataType } from '@shared/type'
import { deleteAudioFile, getMusicFiles, renameAudioFile, selectAudioFile } from './utils/audios'
import {
  addTab,
  deleteTab,
  getAllTabs,
  getAllTabsWithoutTimeData,
  getTab,
  renameTab,
  setActiveTab
} from './utils/tabs'
import {
  addTimeDataToTab,
  checkUserVerified,
  deleteTimeData,
  getOtherData,
  updateSwitch,
  userVerified,
  updateOtherData
} from './utils'
import {
  addScheduledItem,
  deleteScheduledItem,
  getCurrentlyScheduledBellInfo,
  startScheduler,
  stopScheduler,
  updateScheduledItem
} from './scheduler/bellScheduler'
import { notification } from './utils/notification'
import { getTheme, updateTheme } from './utils/theme'

const setupIpcHandlers = async (): Promise<void> => {
  // Tab management
  ipcMain.handle('getTabs', () => getAllTabs())
  ipcMain.handle('getTab', (_, tabId: string) => getTab(tabId))
  ipcMain.handle('addTab', (_, tabData: Tab) => addTab(tabData))
  ipcMain.handle('deleteTab', (_, _id: string) => deleteTab(_id))
  ipcMain.handle('renameTab', (_, _id: string, newTabName: string) => renameTab(_id, newTabName))
  ipcMain.handle('setActiveTab', (_, activeTabId: string, inActiveTabId: string) =>
    setActiveTab(activeTabId, inActiveTabId)
  )
  ipcMain.handle('getAllTabWithOutTimeData', () => getAllTabsWithoutTimeData())

  // Time data management
  ipcMain.handle('addTimeData', (_, _id: string, data: TimeData) => addTimeDataToTab(_id, data))
  ipcMain.handle('deleteTimeData', (_, _id: string, data: TimeData) => deleteTimeData(_id, data))
  ipcMain.handle('updateSwitch', (_, tab_id: string, timeDataID: string, switchState: boolean) =>
    updateSwitch(tab_id, timeDataID, switchState)
  )

  ipcMain.handle('select-music-file', async () => await selectAudioFile())
  ipcMain.handle('get-music-files', async () => await getMusicFiles())
  ipcMain.handle('deleteAudioFile', async (_, fileName: string) => await deleteAudioFile(fileName))
  ipcMain.handle(
    'renameAudioFile',
    async (_, oldFileName: string, newFileName: string) =>
      await renameAudioFile(oldFileName, newFileName)
  )

  // User verification and settings
  ipcMain.handle('userIsVerified', () => userVerified())
  ipcMain.handle('checkUserIsVerified', () => checkUserVerified())
  ipcMain.handle('getOtherData', () => getOtherData())
  ipcMain.handle('updateOtherData', (_, data: OtherDataType) => updateOtherData(data))

  ipcMain.handle('getTheme', () => getTheme())
  ipcMain.handle('updateTheme', (_, newTheme: OtherDataType['theme']) => updateTheme(newTheme))

  // Bell Scheduler
  ipcMain.handle(
    'scheduler:start',
    async (_, timeData: TimeData[], tabId: string, tabName: string) =>
      await startScheduler(timeData, tabId, tabName)
  )
  ipcMain.handle('scheduler:stop', async () => await stopScheduler())
  ipcMain.handle(
    'scheduler:add-item',
    async (_, timeData: TimeData) => await addScheduledItem(timeData)
  )
  ipcMain.handle(
    'scheduler:delete-item',
    async (_, timeId: string) => await deleteScheduledItem(timeId)
  )
  ipcMain.handle(
    'scheduler:update-item',
    async (_, timeData: TimeData) => await updateScheduledItem(timeData)
  )
  ipcMain.handle('scheduler:get-info', () => getCurrentlyScheduledBellInfo())

  // Notification
  ipcMain.handle('notification:success', (_, timeData: TimeData) => notification.success(timeData))
  ipcMain.handle('notification:error', (_, timeData: TimeData) => notification.error(timeData))
}

export default setupIpcHandlers
