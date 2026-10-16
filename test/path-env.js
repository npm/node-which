const t = require('tap')
const { join } = require('path')
const { Worker } = require('worker_threads')
const { once } = require('events')

const nativeWindows = process.platform === 'win32'
const whichFile = require.resolve('..')

const loadWhich = (t, platform, env, executable) => {
  const originalEnv = process.env
  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
  process.env = env
  Object.defineProperty(process, 'platform', { ...originalPlatform, value: platform })
  t.teardown(() => {
    process.env = originalEnv
    Object.defineProperty(process, 'platform', originalPlatform)
  })
  const matches = p => p === executable
  return t.mock('..', { isexe: { isexe: async p => matches(p), sync: matches } })
}

for (const key of ['Path', 'path', 'pAtH']) {
  t.test(`Windows resolves a command from ${key} when PATH is absent`, async t => {
    const dir = t.testdir({ 'fixture.cmd': '@echo fixture\n' })
    const file = join(dir, 'fixture.cmd')
    const which = loadWhich(t, 'win32', { OTHER: 'fixture', [key]: dir, PATHEXT: '.CMD' }, file)
    t.equal(await which('fixture'), file, 'async')
    t.equal(which.sync('fixture'), file, 'sync')
  })
}

t.test('Windows preserves an explicitly present PATH, including an empty value', async t => {
  const dir = t.testdir({ 'fixture.cmd': '@echo fixture\n' })
  const file = join(dir, 'fixture.cmd')
  const env = { PATH: dir, Path: 'ignored', PATHEXT: '.CMD' }
  const which = loadWhich(t, 'win32', env, file)
  t.equal(await which('fixture'), file)
  t.equal(which.sync('fixture'), file)
  env.PATH = ''
  env.Path = dir
  t.equal(await which('fixture', { nothrow: true }), null, 'empty PATH does not fall back')
  t.equal(which.sync('fixture', { nothrow: true }), null)
})

t.test('an explicit path option overrides the Windows environment', async t => {
  const dir = t.testdir({ 'fixture.cmd': '@echo fixture\n' })
  const file = join(dir, 'fixture.cmd')
  const which = loadWhich(t, 'win32', { Path: 'ignored', PATHEXT: '.CMD' }, file)
  t.equal(await which('fixture', { path: dir }), file)
  t.equal(which.sync('fixture', { path: dir }), file)
  t.equal(await which('fixture', { path: '', nothrow: true }), null)
  t.equal(which.sync('fixture', { path: '', nothrow: true }), null)
})

t.test('POSIX ignores differently cased environment names', async t => {
  const dir = t.testdir({ fixture: 'fixture\n' })
  const file = join(dir, 'fixture')
  const env = { Path: dir, path: dir }
  const which = loadWhich(t, 'linux', env, file)
  t.equal(await which('fixture', { nothrow: true }), null)
  t.equal(which.sync('fixture', { nothrow: true }), null)
  env.PATH = dir
  t.equal(await which('fixture'), file, 'uppercase PATH still works')
  t.equal(which.sync('fixture'), file)
})

t.test('Windows with no PATH spelling retains not-found behavior', async t => {
  const which = loadWhich(t, 'win32', { OTHER: 'fixture', PATHEXT: '.CMD' }, '')
  await t.rejects(which('fixture'), { code: 'ENOENT' })
  t.throws(() => which.sync('fixture'), { code: 'ENOENT' })
})

t.test('the Windows fallback reads the current environment on each call', async t => {
  const dir = t.testdir({ 'fixture.cmd': '@echo fixture\n' })
  const file = join(dir, 'fixture.cmd')
  const env = { Path: dir, PATHEXT: '.CMD' }
  const which = loadWhich(t, 'win32', env, file)
  t.equal(await which('fixture'), file)
  delete env.Path
  env.pAtH = 'not-the-fixture-directory'
  t.equal(which.sync('fixture', { nothrow: true }), null)
  env.pAtH = dir
  t.equal(which.sync('fixture'), file)
})

t.test('a real Windows worker resolves Path without inheriting the parent environment', {
  skip: !nativeWindows && 'requires Windows worker environment semantics',
}, async t => {
  const dir = t.testdir({ 'fixture.cmd': '@echo fixture\n' })
  const file = join(dir, 'fixture.cmd')
  const worker = new Worker(`
    const { parentPort } = require('worker_threads')
    const which = require(${JSON.stringify(whichFile)})
    ;(async () => {
      parentPort.postMessage({
        upperPathAbsent: process.env.PATH === undefined,
        async: await which('fixture.cmd', { nothrow: true }),
        sync: which.sync('fixture.cmd', { nothrow: true }),
      })
    })().catch(error => { throw error })
  `, { eval: true, env: { Path: dir, PATHEXT: '.CMD' } })
  t.teardown(() => worker.terminate())
  const [result] = await once(worker, 'message')
  t.same(result, { upperPathAbsent: true, async: file, sync: file })
})
