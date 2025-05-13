import { ipcMain } from 'electron'
import { Tab, TimeData } from '@shared/type'
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
  playAudio,
  updateSwitch,
  userVerified
} from './utils'

const setupIpcHandlers = async (): Promise<void> => {
  // Tab management
  ipcMain.handle('getTabs', () => getAllTabs())
  ipcMain.handle('getTab', (_, tabId: string) => getTab(tabId))
  ipcMain.handle('addTab', (_, tabData: Tab) => addTab(tabData))
  ipcMain.handle('deleteTab', (_, _id: string) => deleteTab(_id))
  ipcMain.handle('renameTab', (_, _id: string, newTabName: string) => {
    renameTab(_id, newTabName)
  })
  ipcMain.handle('setActiveTab', (_, activeTabId: string, inActiveTabId: string) => {
    setActiveTab(activeTabId, inActiveTabId)
  })
  ipcMain.handle('getAllTabWithOutTimeData', () => getAllTabsWithoutTimeData())

  // Time data management
  ipcMain.handle('addTimeData', (_, _id: string, data: TimeData) => addTimeDataToTab(_id, data))
  ipcMain.handle('deleteTimeData', (_, _id: string, data: TimeData) => deleteTimeData(_id, data))
  ipcMain.handle('updateSwitch', (_, tab_id: string, timeDataID: string, switchState: boolean) =>
    updateSwitch(tab_id, timeDataID, switchState)
  )

  // Audio management
  ipcMain.handle(
    'playAudio',
    async (_, audioFileName: string, tab_name: string, timeData: TimeData) => {
      await playAudio(audioFileName, tab_name, timeData)
    }
  )
  ipcMain.handle('select-music-file', async () => await selectAudioFile())
  ipcMain.handle('get-music-files', async () => await getMusicFiles())
  ipcMain.handle('deleteAudioFile', async (_, fileName: string) => await deleteAudioFile(fileName))
  ipcMain.handle(
    'renameAudioFile',
    async (_, oldFileName: string, newFileName: string) =>
      await renameAudioFile(oldFileName, newFileName)
  )

  // User verification
  ipcMain.handle('userIsVerified', () => userVerified())
  ipcMain.handle('checkUserIsVerified', () => checkUserVerified())
}

export default setupIpcHandlers
