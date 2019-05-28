import fs from 'fs'
import Path from 'path'
import fileLoader from 'ks-file-loader'
import { remote } from 'electron'

const { dialog } = remote
const ignore = 'node_modules,.git'.split(',')

export const openDirectory = function (conf) {
  return dialog.showOpenDialog({ properties: conf || ['openFile', 'openDirectory', 'multiSelections'] })
}
export const openFile = function (conf, cb) {
  return dialog.showOpenDialog(conf, cb)
}
export const selectFile = function (conf, then) {
  conf = conf || {}
  conf.properties = conf.properties || ['openFile']
  let path = openFile(conf)
  return path ? fs.readFile(path[0], 'utf8', function (err, data) {
    then && then(err, data, path[0])
  }) : then()
}
export const readFile = function (path, then) {
  return path ? fs.readFile(path, 'utf8', then) : then()
}
export const setFilePath = function (conf, then) {
  return dialog.showSaveDialog(conf, then)
}
export const saveFile = function (filename, text, then) {
  return fs.writeFile(filename, text, then)
}
export const renameFile = function (oldPath, newPath, then) {
  return fs.rename(oldPath, newPath, then)
}
export const mkdir = function (path, mode, then) {
  return fs.mkdir(path, mode, then)
}

export const fileDisplay = (filePath, deep) => {
  return new Promise((resolve, reject) => {
    let index = [filePath.lastIndexOf('\\'), filePath.lastIndexOf('/')]
    let names = filePath.slice(index[index[0] < 0 ? 1 : 0] + 1)
    let files = []
    let dirs = []
    let tree = {
      type: 'dir',
      pos: filePath,
      text: names || filePath,
      opened: 1,
      path: filePath,
      children: []
    }
    fileLoader({
      path: filePath,
      // 文件扩展名, 支持正则
      ext: /.*/,
      // 是否深层遍历
      deep: false,
      // 是否读取文件内容
      readFile: false,
      /**
       * 加载器
       * @param {object} stats 文件信息
       * @param {string} data 文件内容 readFile 为 false 时返回空字符串
       * @param {function} next 文件处理完毕的回调 (必要的)
       */
      error (err) {
        console.log(err)
      },
      loader (stats, data, next) {
        if (stats.type === 'file') {
          let extIndex = stats.name.lastIndexOf('.')
          let ext = extIndex < 0 ? '' : stats.name.slice(extIndex + 1)
          files.push({
            type: 'file',
            path: Path.join(filePath, stats.name),
            text: stats.name,
            // 扩展名
            ext: ext,
            // 显示图标
            icon: (ext ? 'tree-type tree-type-' + ext + ' ' : '') + 'tree-file',
            // 文件信息
            stats: {
              size: stats.size
            },
            // 是否加入到文件tab
            pushed: 0,
            // vue-jstree中的属性
            opened: 0,
            selected: 0
          })
        }
        if (stats.type === 'dir') {
          if (ignore.indexOf(stats.name) < 0) {
            dirs.push({
              type: 'dir',
              path: Path.join(filePath, stats.name),
              pos: stats.name,
              text: stats.name,
              // ext: '',
              stats: {
                size: stats.size
              },
              children: [],
              pushed: 0,
              opened: 0,
              selected: 0
            })
          }
        }
        next()
      },
      // 转换完毕
      done () {
        tree.children = dirs.concat(files)
        console.log(filePath, tree)
        resolve(tree)
      }
    })
  })
}
export const getStats = function (path) {
  return fs.fstatSync(fs.openSync(path, 'r'))
}
export default {
  fs,
  dialog,
  selectFile,
  openFile,
  readFile,
  saveFile,
  renameFile,
  setFilePath,
  mkdir,
  getStats,
  fileDisplay,
  openDirectory
}
