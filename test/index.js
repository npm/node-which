
const t = require('tap')
const fs = require('fs')
const { basename, join, relative, sep, posix, win32 } = require('path')

const DELIMITER = (p) => p === 'win32' ? win32.delimiter : posix.delimiter
const envVars = { PATH: process.env.PATH, PATHEXT: process.env.PATHEXT }

const runTest = async (t, exec, expect, { platforms = ['posix', 'win32'], ...opt } = {}) => {
  t.teardown(() => {
    for (const [k, v] of Object.entries(envVars)) {
      if (v) {
        process.env[k] = v
      } else {
        delete process.env[k]
      }
    }
  })

  for (const platform of platforms) {
    t.test(`${t.name} - ${platform}`, async t => {
      const platformOpt = Object.keys(opt).length ? {
        ...opt,
        ...Array.isArray(opt.path) ? { path: opt.path.join(DELIMITER(platform)) } : {},
        ...Array.isArray(opt.pathExt) ? { pathExt: opt.pathExt.join(DELIMITER(platform)) } : {},
      } : undefined

      const which = t.mock('..', { '../lib/is-windows.js': platform === 'win32' })

      if (expect?.code) {
        await t.rejects(() => which(exec, platformOpt), expect, 'async rejects')
        t.throws(() => which.sync(exec, platformOpt), expect, 'sync throws')
        return
      }

      const syncRes = which.sync(exec, platformOpt)
      const res = await which(exec, platformOpt)

      if (typeof expect === 'string') {
        t.strictSame(syncRes.toLowerCase(), expect.toLowerCase(), 'sync')
        t.strictSame(res.toLowerCase(), expect.toLowerCase(), 'async')
      } else {
        t.strictSame(syncRes, expect, 'sync')
        t.strictSame(res, expect, 'async')
      }
    })
  }
}

t.test('does not find missed', async (t) => {
  const fixture = t.testdir()
  const cmd = join(fixture, 'foobar.sh')

  t.test('throw', async t => {
    await runTest(t, cmd, { code: 'ENOENT' })
  })
  t.test('nothrow', async t => {
    await runTest(t, cmd, null, { nothrow: true })
  })
})

t.test('does not find non-executable', async (t) => {
  const dir = t.testdir({ 'foo.sh': 'echo foo\n' })
  const foo = join(dir, 'foo.sh')

  t.test('absolute', async (t) => {
    await runTest(t, foo, { code: 'ENOENT' })
  })

  t.test('with path', async (t) => {
    await runTest(t, basename(foo), { code: 'ENOENT' }, { path: dir })
  })
})

t.test('find when executable', async t => {
  const fixture = t.testdir({ 'foo.sh': 'echo foo\n' })
  const foo = join(fixture, 'foo.sh')
  fs.chmodSync(foo, '0755')

  t.test('absolute', async (t) => {
    await runTest(t, foo, foo)
  })

  t.test('with process.env.PATH', async (t) => {
    process.env.PATH = fixture
    await runTest(t, basename(foo), foo)
  })

  t.test('with path opt', async (t) => {
    await runTest(t, basename(foo), foo, { path: fixture })
  })

  t.test('no ./', async (t) => {
    const rel = relative(process.cwd(), foo)
    await runTest(t, rel, rel)
  })

  t.test('with ./', async (t) => {
    const rel = `.${sep}${relative(process.cwd(), foo)}`
    await runTest(t, rel, rel)
  })

  t.test('with ../', async (t) => {
    const dir = basename(process.cwd())
    const rel = join('..', dir, relative(process.cwd(), foo))
    await runTest(t, rel, rel)
  })
})

t.test('find all', async t => {
  const cmdName = 'x.cmd'
  const fixture = t.testdir({
    all: {
      a: { [cmdName]: 'exec me' },
      b: { [cmdName]: 'exec me' },
    },
  })
  const dirs = [
    join(fixture, 'all', 'a'),
    join(fixture, 'all', 'b'),
  ]
  const cmds = dirs.map(dir => {
    const cmd = join(dir, cmdName)
    fs.chmodSync(cmd, 0o755)
    return cmd
  })
  await runTest(t, cmdName, cmds, {
    all: true,
    path: dirs.map((dir, index) => index % 2 ? dir : `"${dir}"`),
  })
})

t.test('pathExt', async (t) => {
  const fixture = t.testdir({ 'foo.sh': 'echo foo\n' })
  const foo = join(fixture, 'foo.sh')
  fs.chmodSync(foo, '0755')

  const pathExt = '.SH;.sh'
  const opts = {
    platforms: ['win32'],
  }

  t.test('foo.sh - env vars', async (t) => {
    process.env.PATHEXT = pathExt
    process.env.PATH = fixture
    await runTest(t, basename(foo), foo, opts)
  })

  t.test('foo.sh - opts', async (t) => {
    await runTest(t, basename(foo), foo, { ...opts, path: fixture, pathExt })
  })

  t.test('foo - env vars', async (t) => {
    process.env.PATHEXT = pathExt
    process.env.PATH = fixture
    await runTest(t, basename(foo, '.sh'), foo, opts)
  })

  t.test('foo - opts', async (t) => {
    await runTest(t, basename(foo, '.sh'), foo, { ...opts, path: fixture, pathExt })
  })
})
