const fs = require('fs')
const about = (cb) => {
  const config = require('../package.json')
  let electron = JSON.parse(fs.readFileSync('node_modules/electron/package.json'))
  let result = {
    name: config.name,
    version: config.version,
    electron: electron.version,
    author: config.author,
    license: config.license,
    home: config.home,
    time: new Date().toLocaleString()
  }
  fs.writeFileSync('src/renderer/config/about.json', JSON.stringify(result, null, 2))
  cb && cb()
}
about()
