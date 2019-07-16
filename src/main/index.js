'use strict'
import path from 'path'
import { mainInit } from './mainWin'
import fileLoader from 'ks-file-loader'
fileLoader({
  path: path.join('./'),
  ext: 'js',
  loader (stats, data, next) {
    console.log(path.join(stats.path, stats.name))
  },
  done () {
    console.log(1)
  }
})
// .then(() => {
//   console.log(2)
// })

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
mainInit()
