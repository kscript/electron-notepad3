'use strict'
import { autoUpdater } from 'electron-updater'
import { updateHandle } from './update'
import { app, BrowserWindow, ipcMain } from 'electron'

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

export const createWindow = () => {
  if (mainWindow) return mainWindow
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    // https://electronjs.org/docs/tutorial/security#2-禁止nodejs集成远程内容
    nodeIntegration: false,
    contextIsolation: true,
    width: 1000,
    webPreferences: {
      // webSecurity: false,
      devTools: true
    }
    // frame: false,
    // titleBarStyle: 'hidden',
    // transparent: true,
    // skipTaskbar: true,
    // movable: false,
    // enableLargerThanScreen: true, // mac
    // hasShadow: false
  })
  // mainWindow.webContents.openDevTools({mode: 'detach'})
  // removeDevToolsExtension(name)
  // BrowserWindow.addDevToolsExtension(path.join(__dirname, '../renderer/assets/vue-devtools'))
  // ipcMain.on('devtools', () => {
  //   console.log(BrowserWindow.getExtensions())
  // })
  ipcMain.on('mainCapturePage', event => {
    let size = mainWindow.getContentBounds()
    size.x = 0
    size.y = 0
    mainWindow.capturePage(size, image => {
      event.sender.send('renderCapturePage', [image.toDataURL()])
    })
  })
  mainWindow.loadURL(winURL)
  updateHandle(mainWindow)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  return mainWindow
}

export const mainInit = () => {
  app.whenReady = () => {
    return new Promise(resolve => {
      resolve(true)
    })
  }
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
  app.on('ready', () => {
    createWindow()
    // if (process.env.NODE_ENV === 'production') {
    // autoUpdater.checkForUpdates()
    // }
  })
  ipcMain.on('updateNow', (e, arg) => {
    autoUpdater.quitAndInstall()
  })
  ipcMain.on('checkForUpdate', () => {
    // 执行自动更新检查
    autoUpdater.checkForUpdates()
  })
}

export default {
  mainInit,
  createWindow
}
