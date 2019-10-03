var t = require('tap')
var fs = require('fs')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
const fixdir = `'/fixture-${(+process.env.TAP_CHILD_ID || 0)}`
var fixture = `${__dirname}/${fixdir}`
var which = require('../which.js')
var path = require('path')

var isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys'

var skip = { skip: isWindows ? 'not relevant on windows' : false }

t.test('setup', function (t) {
  rimraf.sync(fixture)
  mkdirp.sync(fixture)
  fs.writeFileSync(fixture + '/foo.sh', 'echo foo\n')
  t.end()
})

t.test('does not find missed', function(t) {
  t.plan(3)

  t.rejects(which(fixture + '/foobar.sh'), {
    code: 'ENOENT',
  })

  t.throws(function () {
    which.sync(fixture + '/foobar.sh')
  }, {code: 'ENOENT'})

  t.equal(which.sync(fixture + '/foobar.sh', {nothrow:true}), null)
})

t.test('does not find non-executable', skip, function (t) {
  t.plan(2)

  t.test('absolute', function (t) {
    t.plan(3)
    which(fixture + '/foo.sh', function (er) {
      t.isa(er, Error)
      t.equal(er.code, 'ENOENT')
    })

    t.throws(function () {
      which.sync(fixture + '/foo.sh')
    }, {code: 'ENOENT'})
  })

  t.test('with path', function (t) {
    t.plan(3)
    which('foo.sh', { path: fixture }, function (er) {
      t.isa(er, Error)
      t.equal(er.code, 'ENOENT')
    })

    t.throws(function () {
      which.sync('foo.sh', { path: fixture })
    }, {code: 'ENOENT'})
  })
})

t.test('make executable', function (t) {
  fs.chmodSync(fixture + '/foo.sh', '0755')
  t.end()
})

t.test('find when executable', function (t) {
  var opt = { pathExt: '.sh' }
  var expect = path.resolve(fixture, 'foo.sh').toLowerCase()
  var PATH = process.env.PATH

  t.test('absolute', function (t) {
    runTest(fixture + '/foo.sh', t)
  })

  t.test('with process.env.PATH', function (t) {
    process.env.PATH = fixture
    runTest('foo.sh', t)
  })

  t.test('with pathExt', {
    skip: isWindows ? false : 'Only for Windows'
  }, function (t) {
    var pe = process.env.PATHEXT
    process.env.PATHEXT = '.SH'
    process.env.PATH = fixture

    t.test('foo.sh', function (t) {
      process.env.PATH = fixture
      runTest('foo.sh', t)
    })
    t.test('foo', function (t) {
      process.env.PATH = fixture
      runTest('foo', t)
    })
    t.test('replace', function (t) {
      process.env.PATHEXT = pe
      t.end()
    })
    t.end()
  })

  t.test('with path opt', function (t) {
    opt.path = fixture
    runTest('foo.sh', t)
  })

  t.test('relative path', function (t) {
    var opt = { pathExt: '.sh' }
    var expect = path.join(`test/${fixdir}/foo.sh`)
    t.plan(3)

    t.test('no ./', function (t) {
      t.plan(2)
      var actual = which.sync(`test/${fixdir}/foo.sh`, opt)
      t.equal(actual, expect)
      which(`test/${fixdir}/foo.sh`, opt, function (er, actual) {
        if (er)
          throw er
        t.equal(actual, expect)
      })
    })

    t.test('with ./', function (t) {
      t.plan(2)
      expect = './' + expect
      var actual = which.sync(`./test/${fixdir}/foo.sh`, opt)
      t.equal(actual, expect)
      which(`./test/${fixdir}/foo.sh`, opt, function (er, actual) {
        if (er)
          throw er
        t.equal(actual, expect)
      })
    })

    t.test('with ../', function (t) {
      t.plan(2)
      var dir = path.basename(process.cwd())
      expect = path.join('..', dir, `test/${fixdir}/foo.sh`)
      var actual = which.sync(expect, opt)
      t.equal(actual, expect)
      which(expect, opt, function (er, actual) {
        if (er)
          throw er
        t.equal(actual, expect)
      })
    })
  })

  function runTest(exec, t) {
    t.plan(2)

    var found = which.sync(exec, opt).toLowerCase()
    t.equal(found, expect)

    which(exec, opt, function (er, found) {
      if (er)
        throw er
      t.equal(found.toLowerCase(), expect)
      t.end()
      process.env.PATH = PATH
    })
  }

  t.end()
})

t.test('find all', t => {
  mkdirp.sync(`${fixture}/all/a`)
  mkdirp.sync(`${fixture}/all/b`)
  fs.writeFileSync(`${fixture}/all/a/x.cmd`, 'exec me')
  fs.writeFileSync(`${fixture}/all/b/x.cmd`, 'exec me')
  fs.chmodSync(`${fixture}/all/a/x.cmd`, 0o755)
  fs.chmodSync(`${fixture}/all/b/x.cmd`, 0o755)
  const opt = {
    path: `${fixture}/all/a:"${fixture}/all/b"`,
    colon: ':',
    all: true,
  }
  const allsync = which.sync('x.cmd', opt)
  t.same(allsync, [`${fixture}/all/a/x.cmd`, `${fixture}/all/b/x.cmd`])
  return which('x.cmd', opt).then(all => {
    t.same(all, [`${fixture}/all/a/x.cmd`, `${fixture}/all/b/x.cmd`])
  })
})

t.test('clean', function (t) {
  rimraf.sync(fixture)
  t.end()
})
