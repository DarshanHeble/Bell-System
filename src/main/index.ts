import {
  app,
  shell,
  BrowserWindow,
  nativeTheme,
  powerSaveBlocker,
  powerMonitor,
  protocol,
  net,
  session,
  globalShortcut
} from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { addOtherData } from './utils'
import { mkdirSync } from 'fs'
import { CUSTOM_PROTOCOL_SCHEME, projectMusicDirPath } from '@shared/constant'
import migrateData from './utils/migrateData'
import setupIpcHandlers from './setupIpcHandlers'
import { pathToFileURL } from 'url'
import { setSchedulerMainWindow } from './scheduler/bellScheduler'
import { registerZoomShortcuts, unregisterZoomShortcuts } from './events'

// set app name
app.setName('Bell System')

// set app to dark mode
nativeTheme.themeSource = 'dark'

//create app music folder
mkdirSync(projectMusicDirPath, { recursive: true })
addOtherData() //add other data in db
migrateData()
console.log(projectMusicDirPath)

// Register the custom protocol as privileged
protocol.registerSchemesAsPrivileged([
  {
    scheme: CUSTOM_PROTOCOL_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true, // Important: allows the protocol to be used for streaming responses (like media)
      corsEnabled: true
    }
  }
])

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

  // set the mainWindow instance to the bell scheduler
  setSchedulerMainWindow(mainWindow)

  app.whenReady().then(() => {
    // Prevent display sleep
    powerMonitor.on('lock-screen', () => {
      console.log('prevent-display-sleep')
      powerSaveBlocker.start('prevent-display-sleep')
    })

    // Prevent app suspension
    powerMonitor.on('suspend', () => {
      console.log('prevent-app-suspension')
      powerSaveBlocker.start('prevent-app-suspension')
    })

    // Register shortcuts when the window gains focus
    mainWindow.on('focus', () => {
      registerZoomShortcuts(mainWindow)
    })

    // Unregister shortcuts when the window loses focus
    mainWindow.on('blur', () => {
      unregisterZoomShortcuts()
    })

    // Initial registration if the window starts focused (usually true)
    if (mainWindow.isFocused()) {
      registerZoomShortcuts(mainWindow)
    }
  })
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
  // ipcMain.on('ping', () => console.log('pong'))

  // Setup IPC handlers
  setupIpcHandlers()

  createWindow()

  // Get the default session (or a specific one if you use multiple sessions)
  const ses = session.defaultSession

  // Handle requests for the custom protocol
  ses.protocol.handle(CUSTOM_PROTOCOL_SCHEME, async (request) => {
    let extractedPathFromUrl = request.url.substring(CUSTOM_PROTOCOL_SCHEME.length + 3)

    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Original Request URL: ${request.url}`)
    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Extracted path from URL: ${extractedPathFromUrl}`)

    // If the path starts with a drive letter (e.g., "c/" or "C/"), re-format it to "C:/"
    // to ensure path.resolve treats it as an absolute path from that drive.
    if (/^[a-zA-Z]\//.test(extractedPathFromUrl)) {
      // Does it start with "letter/" ?
      extractedPathFromUrl =
        extractedPathFromUrl.charAt(0) + ':' + extractedPathFromUrl.substring(1) // "c/" -> "c:/"
    }

    const decodedFilePath = resolve(decodeURIComponent(extractedPathFromUrl))

    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Path for path.resolve: ${extractedPathFromUrl}`)
    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Decoded and Resolved File Path: ${decodedFilePath}`)

    const userMusicDir = app.getPath('music')

    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] User Music Dir: ${userMusicDir}`)
    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Project Music Dir Path: ${projectMusicDirPath}`)

    const normalizedDecodedPath = decodedFilePath.toLowerCase()
    const normalizedUserMusicDir = userMusicDir.toLowerCase()
    const normalizedProjectMusicDir = projectMusicDirPath ? projectMusicDirPath.toLowerCase() : ''

    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Normalized Decoded Path: ${normalizedDecodedPath}`)
    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Normalized User Music Dir: ${normalizedUserMusicDir}`)
    console.log(
      `[${CUSTOM_PROTOCOL_SCHEME}] Normalized Project Music Dir: ${normalizedProjectMusicDir}`
    )

    if (
      !normalizedDecodedPath.startsWith(normalizedUserMusicDir) &&
      (!projectMusicDirPath || !normalizedDecodedPath.startsWith(normalizedProjectMusicDir))
    ) {
      console.error(
        `[${CUSTOM_PROTOCOL_SCHEME}] ACCESS DENIED. Path: ${decodedFilePath}. Not in allowed: ${userMusicDir} OR ${projectMusicDirPath}`
      )
      return new Response(null, { status: 403, statusText: 'Forbidden' })
    }

    console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Access GRANTED to: ${decodedFilePath}`)
    try {
      const fileUrl = pathToFileURL(decodedFilePath).href
      console.log(`[${CUSTOM_PROTOCOL_SCHEME}] Serving file URL for net.fetch: ${fileUrl}`)
      const response = await net.fetch(fileUrl, {
        method: request.method,
        headers: request.headers
      })
      return response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`[${CUSTOM_PROTOCOL_SCHEME}] Error serving file ${decodedFilePath}:`, error)
      let status = 500
      if (error.message.includes('ERR_FILE_NOT_FOUND') || error.code === 'ENOENT') {
        status = 404
      }
      return new Response(null, { status, statusText: error.message || 'Internal Server Error' })
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
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
