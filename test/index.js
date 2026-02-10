
const { test, mock } = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const os = require('os')
const { basename, join, relative, sep, delimiter } = require('path')
const isWindows = process.platform === 'win32'

// Helper to create test directories with automatic cleanup
// Call this within a test context to get automatic cleanup via t.after()
const testdirRegistry = new Set()

function testdir (structure = {}, t = null) {
  const dir = fs.mkdtempSync(join(os.tmpdir(), 'which-test-'))
  function createStructure (base, struct) {
    for (const [name, content] of Object.entries(struct)) {
      const path = join(base, name)
      if (typeof content === 'string') {
        fs.writeFileSync(path, content)
      } else {
        fs.mkdirSync(path, { recursive: true })
        createStructure(path, content)
      }
    }
  }
  createStructure(dir, structure)

  // Register for cleanup
  if (t && t.after) {
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  } else {
    testdirRegistry.add(dir)
  }

  return dir
}

// Cleanup any remaining test directories on process exit
process.on('exit', () => {
  for (const dir of testdirRegistry) {
    try {
      fs.rmSync(dir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors on exit
    }
  }
})

const ENV_VARS = { PATH: process.env.PATH, PATHEXT: process.env.PATHEXT }
const PLATFORM = Object.getOwnPropertyDescriptor(process, 'platform')

const runTest = async (t, exec, expect, { platforms = ['posix', 'win32'], ..._opt } = {}) => {
  t.after(() => {
    for (const [k, v] of Object.entries(ENV_VARS)) {
      if (v) {
        process.env[k] = v
      } else {
        delete process.env[k]
      }
    }
  })

  for (const platform of platforms) {
    await t.test(`${t.name} - ${platform}`, async t => {
      Object.defineProperty(process, 'platform', { ...PLATFORM, value: platform })

      t.after(() => {
        Object.defineProperty(process, 'platform', PLATFORM)
      })

      // pass in undefined if there are no opts to test default argß
      const opt = Object.keys(_opt).length ? { ..._opt } : undefined

      // if we are actually on windows but testing posix we have to
      // mock isexe since that has special windows detection inside
      // of it. this is mostly to get 100% coverage on windows
      let mockContext
      if (isWindows && platform === 'posix') {
        const isexe = async (p) => [].concat(expect).includes(p)
        isexe.sync = (p) => [].concat(expect).includes(p)

        // Use node:test mock functionality
        mockContext = mock.module('isexe', {
          namedExports: {
            isexe,
            sync: isexe.sync,
          },
        })
      }

      // Clear cache to get fresh module with mocks
      delete require.cache[require.resolve('..')]
      const which = require('..')

      if (expect?.code) {
        await assert.rejects(() => which(exec, opt), expect, 'async rejects')
        assert.throws(() => which.sync(exec, opt), expect, 'sync throws')
      } else {
        assert.deepStrictEqual(await which(exec, opt), expect, 'async')
        assert.deepStrictEqual(which.sync(exec, opt), expect, 'sync')
      }

      // Restore mocks
      if (mockContext) {
        mockContext.restore()
      }
    })
  }
}

test('does not find missed', async (t) => {
  const fixture = testdir({}, t)
  const cmd = join(fixture, 'foobar.sh')

  await t.test('throw', async t => {
    await runTest(t, cmd, { code: 'ENOENT' })
  })
  await t.test('nothrow', async t => {
    await runTest(t, cmd, null, { nothrow: true })
  })
})

test('does not find non-executable', async (t) => {
  const dir = testdir({ 'foo.sh': 'echo foo\n' }, t)
  const foo = join(dir, 'foo.sh')

  await t.test('absolute', async (t) => {
    await runTest(t, foo, { code: 'ENOENT' })
  })

  await t.test('with path', async (t) => {
    await runTest(t, basename(foo), { code: 'ENOENT' }, { path: dir })
  })
})

test('find when executable', async t => {
  const fixture = testdir({ 'foo.sh': 'echo foo\n' }, t)
  const foo = join(fixture, 'foo.sh')
  fs.chmodSync(foo, '0755')

  // windows needs to explicitly look for .sh files by default
  const opts = isWindows ? { pathExt: '.sh' } : {}

  await t.test('absolute', async (t) => {
    await runTest(t, foo, foo, opts)
  })

  await t.test('with process.env.PATH', async (t) => {
    process.env.PATH = fixture
    await runTest(t, basename(foo), foo, opts)
  })

  await t.test('with path opt', async (t) => {
    await runTest(t, basename(foo), foo, { ...opts, path: fixture })
  })

  await t.test('no ./', async (t) => {
    const rel = relative(process.cwd(), foo)
    await runTest(t, rel, rel, opts)
  })

  await t.test('with ./', async (t) => {
    const rel = `.${sep}${relative(process.cwd(), foo)}`
    await runTest(t, rel, rel, opts)
  })

  await t.test('with ../', async (t) => {
    const dir = basename(process.cwd())
    const rel = join('..', dir, relative(process.cwd(), foo))
    await runTest(t, rel, rel, opts)
  })
})

test('find all', async t => {
  const cmdName = 'x.cmd'
  const fixture = testdir({
    all: {
      a: { [cmdName]: 'exec me' },
      b: { [cmdName]: 'exec me' },
    },
  }, t)
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
    path: dirs.map((dir, index) => index % 2 ? dir : `"${dir}"`).join(delimiter),
  })
})

test('pathExt', async (t) => {
  const fixture = testdir({ 'foo.sh': 'echo foo\n' }, t)
  const foo = join(fixture, 'foo.sh')
  fs.chmodSync(foo, '0755')

  const pathExt = '.sh'
  const opts = { platforms: ['win32'] }

  await t.test('foo.sh - env vars', async (t) => {
    process.env.PATHEXT = pathExt
    process.env.PATH = fixture
    await runTest(t, basename(foo), foo, opts)
  })

  await t.test('foo.sh - opts', async (t) => {
    await runTest(t, basename(foo), foo, { ...opts, path: fixture, pathExt })
  })

  await t.test('foo - env vars', async (t) => {
    process.env.PATHEXT = pathExt
    process.env.PATH = fixture
    await runTest(t, basename(foo, '.sh'), foo, opts)
  })

  await t.test('foo - opts', async (t) => {
    await runTest(t, basename(foo, '.sh'), foo, { ...opts, path: fixture, pathExt })
  })

  await t.test('foo - no pathext', async (t) => {
    await runTest(t, basename(foo, '.sh'), { code: 'ENOENT' }, {
      ...opts,
      path: fixture,
      pathExt: '',
    })
  })
})
