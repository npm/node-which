
const t = require('tap')
const fs = require('fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { basename, join, relative, sep, delimiter } = require('path')

const fixdir = `fixture-${(+process.env.TAP_CHILD_ID || 0)}`
const fixture = join(__dirname, fixdir)
const foo = join(fixture, 'foo.sh')

const which = (...args) => t.mock('..')(...args)
which.sync = (...args) => t.mock('..').sync(...args)

t.before(() => {
  rimraf.sync(fixture)
  mkdirp.sync(fixture)
  fs.writeFileSync(foo, 'echo foo\n')
})

t.teardown(() => {
  rimraf.sync(fixture)
})

t.test('does not find missed', async (t) => {
  const p = join(fixture, 'foobar.sh')
  await t.rejects(() => which(p), { code: 'ENOENT' })
  t.equal(await which(p, { nothrow: true }), null)

  t.throws(() => which.sync(p), { code: 'ENOENT' })
  t.equal(which.sync(p, { nothrow: true }), null)
})

t.test('does not find non-executable', async (t) => {
  t.test('absolute', async (t) => {
    await t.rejects(() => which(foo), { code: 'ENOENT' })
    t.throws(() => which.sync(foo), { code: 'ENOENT' })
  })

  t.test('with path', async (t) => {
    await t.rejects(() => which(basename(foo), { path: fixture }), { code: 'ENOENT' })
    t.throws(() => which.sync(basename(foo), { path: fixture }), { code: 'ENOENT' })
  })
})

t.test('find when executable', async (t) => {
  t.before(() => fs.chmodSync(foo, '0755'))

  const { PATH, PATHEXT } = process.env
  t.afterEach(() => {
    if (PATH) {
      process.env.PATH = PATH
    } else {
      delete process.env.PATH
    }
    if (PATHEXT) {
      process.env.PATHEXT = PATHEXT
    } else {
      delete process.env.PATHEXT
    }
    delete process.env.WHICH_FAKE_PLATFORM
  })

  const runTest = async (exec, expect, t, opt = {}) => {
    opt.pathExt = '.sh'
    if (typeof expect === 'string') {
      const found = which.sync(exec, opt).toLowerCase()
      t.equal(found, expect.toLowerCase())

      const res = await which(exec, opt)
      t.equal(res.toLowerCase(), expect.toLowerCase())
    } else {
      await t.rejects(() => which(exec), expect)
      t.throws(() => which.sync(exec), expect)
    }
  }

  t.test('absolute', async (t) => {
    return runTest(foo, foo, t)
  })

  t.test('with process.env.PATH', async (t) => {
    process.env.PATH = fixture
    return runTest(basename(foo), foo, t)
  })

  t.test('pathExt', async (t) => {
    t.test('foo.sh', async (t) => {
      process.env.WHICH_FAKE_PLATFORM = 'win32'
      process.env.PATHEXT = '.SH'
      process.env.PATH = fixture
      return runTest(basename(foo), foo, t)
    })

    t.test('foo', async (t) => {
      process.env.WHICH_FAKE_PLATFORM = 'win32'
      process.env.PATHEXT = '.SH'
      process.env.PATH = fixture
      return runTest(basename(foo, '.sh'), foo, t)
    })

    t.test('foo nopathext', async (t) => {
      process.env.WHICH_FAKE_PLATFORM = 'win32'
      process.env.PATH = fixture
      return runTest(basename(foo, '.sh'), { code: 'ENOENT' }, t)
    })
  })

  t.test('with path opt', async (t) => {
    return runTest(basename(foo), foo, t, { path: fixture })
  })

  t.test('no ./', async (t) => {
    const rel = relative(process.cwd(), foo)
    return runTest(rel, rel, t)
  })

  t.test('with ./', async (t) => {
    const rel = `.${sep}${relative(process.cwd(), foo)}`
    return runTest(rel, rel, t)
  })

  t.test('with ../', async (t) => {
    const dir = basename(process.cwd())
    const rel = join('..', dir, relative(process.cwd(), foo))
    return runTest(rel, rel, t)
  })
})

t.test('find all', async t => {
  mkdirp.sync(`${fixture}/all/a`)
  mkdirp.sync(`${fixture}/all/b`)
  fs.writeFileSync(`${fixture}/all/a/x.cmd`, 'exec me')
  fs.writeFileSync(`${fixture}/all/b/x.cmd`, 'exec me')
  fs.chmodSync(`${fixture}/all/a/x.cmd`, 0o755)
  fs.chmodSync(`${fixture}/all/b/x.cmd`, 0o755)

  const opt = {
    path: [`${fixture}/all/a`, `"${fixture}/all/b"`].join(delimiter),
    all: true,
  }
  const expect = [
    join(fixture, 'all', 'a', 'x.cmd'),
    join(fixture, 'all', 'b', 'x.cmd'),
  ]
  t.same(which.sync('x.cmd', opt), expect)
  t.same(await which('x.cmd', opt), expect)
})
