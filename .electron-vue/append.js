// 用于添加版本更新时的日志
const fs = require("fs")
const path = require("path")
const config = require(path.join(__dirname, '../package.json'))

const cb2promise = (func) => {
    return new Promise((resolve, reject) => {
        func((error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data)
            }
        })
    })
}

const readFile = (path) => {
    return cb2promise((done) => {
        fs.readFile(path, done)
    })
}
const writeFile = (path, data) => {
    return cb2promise((done) => {
        fs.writeFile(path, data, done)
    })
}

Promise.all([
    readFile(path.join(__dirname, '../build/latest.yml')),
    readFile(path.join(__dirname, '../log/', config.version+'.yml'))
]).then(([latest, change]) => {
    return new Promise((resolve, reject) => {
        writeFile(path.join(__dirname, '../build/latest.yml'), [latest, '# update info', change].join('\n'))
    })
}).catch(e => {
    console.log('添加版本更新日志出错', e)
})
