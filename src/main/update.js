import { autoUpdater } from 'electron-updater'
let config = require('../../package.json')
let init = false
let message = {
  error: '检查更新出错',
  checking: '正在检查更新……',
  updateAva: '检测到新版本，正在下载……',
  updateDownloaded: '已下载最新版本',
  updateNotAva: '现在使用的就是最新版本，不用更新'
}
export const updateHandle = (mainWindow) => {
  if (init) {
    return mainWindow
  }
  init = true
  // 通过main进程发送事件给renderer进程，提示更新信息
  const sendUpdateMessage = (state, info) => {
    mainWindow.webContents.send('message', state, message[state], info)
  }
  autoUpdater.currentVersion = config.version
  autoUpdater.setFeedURL(config.build.publish.url)
  // autoUpdater.setFeedURL({
  //   provider: 'github',
  //   owner: 'kscript',
  //   repo: 'electron-notepad3',
  //   token: '576c54b61c3f0f03c74d570be47b82f793a82f59',
  //   vPrefixedTagName: false,
  //   releaseType: 'release',
  //   publishAutoUpdate: true
  // })
  autoUpdater.on('error', function (ev, error) {
    sendUpdateMessage('error', ev, error)
  })
  autoUpdater.on('checking-for-update', function (info) {
    sendUpdateMessage('checking', info)
  })
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage('updateAva', info)
  })
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage('updateNotAva', info)
  })
  autoUpdater.on('isUpdateAvailable', function (info) {
    sendUpdateMessage('isUpdateAvailable', info)
  })
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
  /**
   * Auto Updater
   *
   * Uncomment the following code below and install `electron-updater` to
   * support auto updating. Code Signing with a valid certificate is required.
   * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
   */
  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateMessage('updateDownloaded', info)
  })
  return mainWindow
}

export default {
  updateHandle
}
