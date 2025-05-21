import { BrowserWindow, globalShortcut } from 'electron'

const ZOOM_STEP = 0.1

export function registerZoomShortcuts(mainWindow: BrowserWindow): void {
  const shortcuts = [
    {
      accelerators: ['CmdOrCtrl+=', 'CmdOrCtrl+numadd'], // Zoom In (main key and numpad plus)
      action: (): void => {
        if (mainWindow && mainWindow.webContents.isFocused()) {
          const currentFactor = mainWindow.webContents.zoomFactor
          mainWindow.webContents.zoomFactor = Math.min(3.0, currentFactor + ZOOM_STEP) // Max 300%
        }
      }
    },
    {
      accelerators: ['CmdOrCtrl+-', 'CmdOrCtrl+numsub'], // Zoom Out (main key and numpad minus)
      // 'numsub' is for numpad subtract
      action: (): void => {
        if (mainWindow && mainWindow.webContents.isFocused()) {
          const currentFactor = mainWindow.webContents.zoomFactor
          mainWindow.webContents.zoomFactor = Math.max(0.5, currentFactor - ZOOM_STEP) // Min 50%
        }
      }
    },
    {
      accelerators: ['CmdOrCtrl+0', 'CmdOrCtrl+num0'], // Reset Zoom (main key and numpad zero)
      // 'num0' is for numpad 0
      action: (): void => {
        if (mainWindow && mainWindow.webContents.isFocused()) {
          mainWindow.webContents.zoomFactor = 1.0 // 100%
        }
      }
    }
  ]

  shortcuts.forEach((shortcutConfig) => {
    shortcutConfig.accelerators.forEach((accelerator) => {
      if (!globalShortcut.register(accelerator, shortcutConfig.action)) {
        console.error(`Failed to register shortcut: ${accelerator}`)
      }
      //   else {
      //     console.log(`Shortcut registered: ${accelerator}`)
      //   }
    })
  })
}

export function unregisterZoomShortcuts(): void {
  globalShortcut.unregister('CmdOrCtrl+=')
  globalShortcut.unregister('CmdOrCtrl+-')
  globalShortcut.unregister('CmdOrCtrl+0')
  //   console.log('Zoom shortcuts unregistered.')
}
