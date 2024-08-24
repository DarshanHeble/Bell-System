import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  dialog,
  powerSaveBlocker,
  powerMonitor,
  Notification
  // Notification
} from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Tab, TimeData } from '@shared/type'
import {
  addTab,
  addTimeDataToTab,
  deleteTab,
  deleteTimeData,
  getAllTabs,
  playAudio,
  renameTab
} from './utils'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { projectMusicDirPath } from '@shared/constant'

// set app name
app.setName('Bell System')

// set app to dark mode
nativeTheme.themeSource = 'dark'

//create app music folder
mkdirSync(projectMusicDirPath, { recursive: true })

// Prevent app suspension
// powerSaveBlocker.start('prevent-app-suspension')

// const NOTIFICATION_TITLE = 'Basic Notification'
// const NOTIFICATION_BODY = 'Notification from the Main process'

// function showNotification(): void {
//   new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
// }

app.on('ready', () => {
  // Prevent display sleep
  powerMonitor.on('lock-screen', () => {
    powerSaveBlocker.start('prevent-display-sleep')
  })

  // Prevent app suspension
  powerMonitor.on('suspend', () => {
    powerSaveBlocker.start('prevent-app-suspension')
  })
  new Notification({
    title: 'Bell System',
    subtitle: 'classes',
    body: `Bell On: 3:21am`,
    icon: path.join(__dirname, '../../resources/icon.ico')
  }).show()
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('addTab', (_, tabData: Tab) => addTab(tabData))
  ipcMain.handle('deleteTab', (_, _id: string) => deleteTab(_id))
  ipcMain.handle('renameTab', (_, _id: string, newTabName: string) => {
    renameTab(_id, newTabName)
  })

  ipcMain.handle('getTabs', () => getAllTabs())

  ipcMain.handle('addTimeData', (_, _id: string, data: TimeData) => addTimeDataToTab(_id, data))
  ipcMain.handle('deleteTimeData', (_, _id: string, data: TimeData) => deleteTimeData(_id, data))

  ipcMain.handle(
    'playAudio',
    async (_, audiofileName: string, tab_name: string, timedata: TimeData) => {
      await playAudio(audiofileName, tab_name, timedata)
    }
  )

  ipcMain.handle('select-music-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }]
      })

      if (result.canceled) {
        return null
      } else {
        const filePath = result.filePaths[0]
        const destinationPath = path.join(projectMusicDirPath, path.basename(filePath))

        // Ensure the music directory exists
        mkdirSync(projectMusicDirPath, { recursive: true })

        // Copy the file
        copyFileSync(filePath, destinationPath)

        return destinationPath
      }
    } catch (error) {
      console.error('Error selecting and copying music file:', error)
      return null
    }
  })

  ipcMain.handle('get-music-files', async () => {
    // Ensure the directory exists
    if (!existsSync(projectMusicDirPath)) {
      return []
    }

    // Read the directory contents
    const files = readdirSync(projectMusicDirPath)
    console.log('Got this files', files)

    // Filter for audio files only
    const audioFiles = files.filter((file) => /\.(mp3|wav|ogg)$/i.test(file))
    console.log('filtered files', audioFiles)

    return audioFiles
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  // db.close()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
