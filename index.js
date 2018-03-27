let fs = require('graceful-fs')
let writer = require('fstorm')
let hash = require('string-hash')
let osTmpdir = require('os-tmpdir')
let { Promise } = require('rsvp')
let { join: resolvePath } = require('path')

let tmpDir = resolvePath(osTmpdir(), 'ember-api-docs')
console.log(`FASTBOOT-FS-CACHE-DIR: ${tmpDir}`)

class NimbleFastbootCache {
  constructor() {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir)
    }
    this.cacheDir = tmpDir
  }

  resolveFileName(path) {
    return resolvePath(this.cacheDir, `${hash(path)}.html`)
  }

  fetch(path, request) {
    return new Promise((resolve, reject) => {
      fs.readFile(this.resolveFileName(path), 'utf8', (err, data) => {
        if (err) {
          //NOTE: Should've been reject but unfortunately the fastboot server isn't implemented to handle rejects on misses
          return resolve()
        }
        resolve(data)
      })
    })
  }

  put(path, body, response) {
    return new Promise((resolve, reject) => {
      let statusCode = response && response.statusCode
      let statusCodeStr = statusCode && statusCode + ''

      if (statusCodeStr && statusCodeStr.length && statusCodeStr.charAt(0) === '3') {
        res()
        return
      }

      writer(this.resolveFileName(path)).write(body, (err, status) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }
}

module.exports = NimbleFastbootCache
