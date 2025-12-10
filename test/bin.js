const { test } = require('node:test')
const assert = require('node:assert')
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

test('finds node', async () => {
  const { code, signal, out, err } = await which('node')
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 0)
  assert.strictEqual(err, '')
  assert.match(out, /[\\/]node(\.exe)?$/i)
})

test('does not find flergyderp', async () => {
  const { code, signal, out, err } = await which('flergyderp')
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 1)
  assert.strictEqual(err, '')
  assert.strictEqual(out, '')
})

test('finds node and eslint', async () => {
  const { code, signal, out, err } = await which(['node', 'eslint'])
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 0)
  assert.strictEqual(err, '')
  const lines = out.split(/[\r\n]+/)
  assert.match(lines[0], /[\\/]node(\.exe)?$/i)
  assert.match(lines[1], /[\\/]eslint(\.cmd)?$/i)
})

test('finds node and eslint, but not flergyderp', async () => {
  const { code, signal, out, err } = await which(['node', 'flergyderp', 'eslint'])
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 1)
  assert.strictEqual(err, '')
  const lines = out.split(/[\r\n]+/)
  assert.match(lines[0], /[\\/]node(\.exe)?$/i)
  assert.match(lines[1], /[\\/]eslint(\.cmd)?$/i)
})

test('cli flags', async (t) => {
  const p = require('path').dirname(bin)

  for (const c of ['-a', '-s', '-as', '-sa']) {
    await t.test(c, { skip: process.platform === 'win32' && /a/.test(c) ? 'windows does not have builtin "which"' : false }, async () => {
      let { code, signal, out, err } = await which(['which', c], p)
      assert.strictEqual(signal, null)
      assert.strictEqual(code, 0)
      assert.strictEqual(err, '')
      if (/s/.test(c)) {
        assert.strictEqual(out, '', 'should be silent')
      } else if (/a/.test(c)) {
        out = out.split(/[\r\n]+/)
        assert.ok(out.length > 0, 'should have a result')
      }
    })
  }
})

test('shows usage', async () => {
  const { code, signal, out, err } = await which()
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 1)
  assert.strictEqual(err, 'usage: which [-as] program ...')
  assert.strictEqual(out, '')
})

test('complains about unknown flag', async () => {
  const { code, signal, out, err } = await which(['node', '-sax'])
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 1)
  assert.strictEqual(out, '')
  assert.strictEqual(err, 'which: illegal option -- x\nusage: which [-as] program ...')
})

test('anything after -- is ignored', async () => {
  const { code, signal, out, err } = await which(['node', '--', '--anything-goes-here'])
  assert.strictEqual(signal, null)
  assert.strictEqual(code, 0)
  assert.strictEqual(err, '')
  assert.match(out, /[\\/]node(\.exe)?$/i)
})
