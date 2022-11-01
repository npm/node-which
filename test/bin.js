const t = require('tap')
const spawn = require('child_process').spawn

const node = process.execPath
const bin = require.resolve('../bin/which.js')

function which (args, extraPath) {
  const options = {}

  if (extraPath) {
    const sep = process.platform === 'win32' ? ';' : ':'
    const p = process.env.PATH + sep + extraPath
    options.env = Object.keys(process.env).reduce(function (env, k) {
      if (!k.match(/^path$/i)) {
        env[k] = process.env[k]
      }
      return env
    }, { PATH: p })
  }

  return new Promise((res) => {
    let out = ''
    let err = ''
    const child = spawn(node, [bin].concat(args).filter(Boolean), options)
    child.stdout.on('data', (c) => out += c)
    child.stderr.on('data', (c) => err += c)
    child.on('close', (code, signal) => {
      out = out.trim()
      err = err.trim()
      res({ code, signal, out, err })
    })
  })
}

t.test('finds node', async (t) => {
  const { code, signal, out, err } = await which('node')
  t.equal(signal, null)
  t.equal(code, 0)
  t.equal(err, '')
  t.match(out, /[\\/]node(\.exe)?$/i)
})

t.test('does not find flergyderp', async (t) => {
  const { code, signal, out, err } = await which('flergyderp')
  t.equal(signal, null)
  t.equal(code, 1)
  t.equal(err, '')
  t.match(out, '')
})

t.test('finds node and tap', async (t) => {
  const { code, signal, out, err } = await which(['node', 'tap'])
  t.equal(signal, null)
  t.equal(code, 0)
  t.equal(err, '')
  t.match(out.split(/[\r\n]+/), [
    /[\\/]node(\.exe)?$/i,
    /[\\/]tap(\.cmd)?$/i,
  ])
})

t.test('finds node and tap, but not flergyderp', async (t) => {
  const { code, signal, out, err } = await which(['node', 'flergyderp', 'tap'])
  t.equal(signal, null)
  t.equal(code, 1)
  t.equal(err, '')
  t.match(out.split(/[\r\n]+/), [
    /[\\/]node(\.exe)?$/i,
    /[\\/]tap(\.cmd)?$/i,
  ])
})

t.test('cli flags', async (t) => {
  const p = require('path').dirname(bin)

  for (const c of ['-a', '-s', '-as', '-sa']) {
    t.test(c, async (t) => {
      let { code, signal, out, err } = await which(['which', c], p)
      t.equal(signal, null)
      t.equal(code, 0)
      t.equal(err, '')
      if (/s/.test(c)) {
        t.equal(out, '', 'should be silent')
      } else if (/a/.test(c)) {
        out = out.split(/[\r\n]+/)
        const opt = { actual: out }
        if (process.platform === 'win32') {
          opt.skip = 'windows does not have builtin "which"'
        }
        t.ok(out.length > 0, 'should have a result', opt)
      }
    })
  }
})

t.test('shows usage', async (t) => {
  const { code, signal, out, err } = await which()
  t.equal(signal, null)
  t.equal(code, 1)
  t.equal(err, 'usage: which [-as] program ...')
  t.equal(out, '')
})

t.test('complains about unknown flag', async (t) => {
  const { code, signal, out, err } = await which(['node', '-sax'])
  t.equal(signal, null)
  t.equal(code, 1)
  t.equal(out, '')
  t.equal(err, 'which: illegal option -- x\nusage: which [-as] program ...')
})

t.test('anything after -- is ignored', async (t) => {
  const { code, signal, out, err } = await which(['node', '--', '--anything-goes-here'])
  t.equal(signal, null)
  t.equal(code, 0)
  t.equal(err, '')
  t.match(out, /[\\/]node(\.exe)?$/i)
})
