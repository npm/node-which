const { win32, posix } = require('path')

const isWindows = process.platform === 'win32' ||
  process.env.OSTYPE === 'cygwin' ||
  process.env.OSTYPE === 'msys'

module.exports = {
  isWindows,
  delimiter: isWindows ? win32.delimiter : posix.delimiter,
}
