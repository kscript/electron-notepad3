import { remote, shell } from 'electron'
import { Bus } from './eventBus'
let { Menu, MenuItem } = remote
export const commonMenu = function () {
  return [
    {
      role: 'help',
      label: '帮助',
      submenu: [
        { type: 'separator' },
        {
          label: '关于',
          click () {
            Bus.$emit('about')
          }
        },
        {
          label: 'Electron文档',
          click () {
            shell.openExternal('https://electronjs.org')
          }
        },
        {
          label: '检查更新',
          click () {
            Bus.$emit('checkForUpdate')
          }
        }
      ]
    }
  ]
}
export const editorMenu = function () {
  let common = commonMenu()
  let template = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开文件',
          accelerator: 'CommandOrControl + O',
          click () {
            Bus.$emit('openFile')
          }
        },
        {
          label: '打开文件夹',
          accelerator: 'Shift + CommandOrControl + O',
          click () {
            Bus.$emit('setDir')
          }
        },
        {
          label: '新建文件',
          accelerator: 'CommandOrControl + N',
          click () {
            Bus.$emit('newFile')
          }
        },
        {
          label: '保存文件',
          accelerator: 'CommandOrControl + S',
          click () {
            Bus.$emit('saveFile')
          }
        },
        {
          label: '另存为',
          accelerator: 'Shift + CommandOrControl + S',
          click () {
            Bus.$emit('saveAsFile')
          }
        },
        {
          label: '设置',
          accelerator: 'CommandOrControl + C',
          click () {
            Bus.$emit('openSettings')
          }
        },
        {
          label: '退出',
          role: 'quit',
          accelerator: 'CommandOrControl + E'
        }
      ]
    },
    {
      label: '查看',
      submenu: [
        { role: 'reload', label: '重载' },
        { role: 'forcereload', label: '硬性重载' },
        { type: 'separator' },
        { role: 'resetzoom', label: '重置' },
        { role: 'zoomin', label: '放大' },
        { role: 'zoomout', label: '缩小' },
        { type: 'separator' },
        { role: 'minimize', label: '最小化' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '调试',
      submenu: [
        { role: 'toggledevtools', label: '开发者工具', accelerator: 'F12' },
        {
          label: '终端',
          accelerator: 'CommandOrControl + T',
          click () {
            Bus.$emit('toggleTerminal')
          }
        }
      ]
    }
  ]
  template = template.concat(common)
  let menus = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menus)
}

export const headMenu = function () {
  editorMenu()
}
export const contentMenu = function (area) {
}
export default {
  headMenu,
  editorMenu,
  contentMenu,
  remote,
  Menu,
  MenuItem
}
