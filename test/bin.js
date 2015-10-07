var t = require('tap')
var spawn = require('child_process').spawn
var node = process.execPath
var bin = require.resolve('../bin/which')

function which (args, cb) {
  var out = ''
  var err = ''
  var child = spawn(node, [bin].concat(args))
  child.stdout.on('data', function (c) {
    out += c
  })
  child.stderr.on('data', function (c) {
    err += c
  })
  child.on('close', function (code, signal) {
    cb(code, signal, out.trim(), err.trim())
  })
}

t.test('finds node', function (t) {
  which('node', function (code, signal, out, err) {
    t.equal(signal, null)
    t.equal(code, 0)
    t.equal(err, '')
    t.match(out, /[\\\/]node(\.exe)?$/)
    t.end()
  })
})

t.test('does not find flergyderp', function (t) {
  which('flergyderp', function (code, signal, out, err) {
    t.equal(signal, null)
    t.equal(code, 1)
    t.equal(err, '')
    t.match(out, '')
    t.end()
  })
})

t.test('finds node and tap', function (t) {
  which(['node', 'tap'], function (code, signal, out, err) {
    t.equal(signal, null)
    t.equal(code, 0)
    t.equal(err, '')
    t.match(out.split(/\n/), [
      /[\\\/]node(\.exe)?$/,
      /[\\\/]tap(\.cmd)?$/
    ])
    t.end()
  })
})

t.test('finds node and tap, but not flergyderp', function (t) {
  which(['node', 'flergyderp', 'tap'], function (code, signal, out, err) {
    t.equal(signal, null)
    t.equal(code, 1)
    t.equal(err, '')
    t.match(out.split(/\n/), [
      /[\\\/]node(\.exe)?$/,
      /[\\\/]tap(\.cmd)?$/
    ])
    t.end()
  })
})
