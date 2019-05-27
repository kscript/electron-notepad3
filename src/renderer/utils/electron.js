import Electron from 'electron'
export const electron = Electron
export const ipcRenderer = electron.ipcRenderer
export default {
  electron,
  ipcRenderer
}
