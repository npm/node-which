// pretend to be Windows.
if (process.platform === 'win32') {
  const t = require('tap')
  t.plan(0, 'already on windows')
  process.exit(0)
}

process.env.Path = process.env.PATH.split(':').join(';')
process.env.OSTYPE = 'cygwin'
require('./basic.js')
