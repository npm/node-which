const { isexe, sync: isexeSync } = require('isexe')
const { join, delimiter, sep, posix, win32 } = require('path')

const isWindows = process.platform === 'win32'

// used to check for slashed in commands passed in. always checks for the posix
// seperator on all platforms, and checks for the current separator when not on
// a posix platform. don't use the isWindows check for this since that is mocked
// in tests but we still need the code to actually work when called. that is also
// why it is ignored from coverage.
/* istanbul ignore next */
const rSlash = new RegExp(`[${posix.sep}${sep === posix.sep ? '' : sep}]`.replace(/(\\)/g, '\\$1'))
const rRel = new RegExp(`^\\.${rSlash.source}`)
const rDrive = /^[A-Za-z]:/

const getNotFoundError = (cmd) =>
  Object.assign(new Error(`not found: ${cmd}`), { code: 'ENOENT' })

// Split a ':' PATH without treating the colon in "D:\..." / "C:/" / trailing
// "D:" as a delimiter. Naive String#split(':') truncates those entries and
// never walks later directories (https://github.com/npm/node-which/issues/56).
const splitColonPathEnv = (pathStr) => {
  const parts = []
  let start = 0
  for (let i = 0; i < pathStr.length; i++) {
    if (pathStr[i] !== ':') {
      continue
    }
    const segment = pathStr.slice(start, i)
    const next = pathStr[i + 1]
    if (/^[A-Za-z]$/.test(segment) && (next === '\\' || next === '/' || next === undefined)) {
      continue
    }
    parts.push(pathStr.slice(start, i))
    start = i + 1
  }
  parts.push(pathStr.slice(start))
  return parts
}

const splitPathEnv = (pathStr, delim) => {
  // Windows PATH is ';'-separated. If a colon split was requested but the
  // string is clearly a Windows PATH, prefer ';' so "D:\..." stays intact.
  if (delim !== ';' && /;[A-Za-z]:[\\/]/.test(pathStr)) {
    return pathStr.split(';')
  }
  if (delim === ':') {
    return splitColonPathEnv(pathStr)
  }
  return pathStr.split(delim)
}

const getPathInfo = (cmd, {
  path: optPath = process.env.PATH,
  pathExt: optPathExt = process.env.PATHEXT,
  delimiter: optDelimiter = delimiter,
}) => {
  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  const pathEnv = cmd.match(rSlash) ? [''] : [
    // windows always checks the cwd first
    ...(isWindows ? [process.cwd()] : []),
    ...splitPathEnv(optPath || /* istanbul ignore next: very unusual */ '', optDelimiter),
  ]

  if (isWindows) {
    const pathExtExe = optPathExt ||
      ['.EXE', '.CMD', '.BAT', '.COM'].join(optDelimiter)
    const pathExt = pathExtExe.split(optDelimiter).flatMap((item) => [item, item.toLowerCase()])
    if (cmd.includes('.') && pathExt[0] !== '') {
      pathExt.unshift('')
    }
    return { pathEnv, pathExt, pathExtExe }
  }

  return { pathEnv, pathExt: [''] }
}

const getPathPart = (raw, cmd) => {
  const pathPart = /^".*"$/.test(raw) ? raw.slice(1, -1) : raw
  const prefix = !pathPart && rRel.test(cmd) ? cmd.slice(0, 2) : ''
  const joined = rDrive.test(pathPart) ? win32.join(pathPart, cmd) : join(pathPart, cmd)
  return prefix + joined
}

const checkExe = async (file, pathExtExe) => {
  try {
    return await isexe(file, { pathExt: pathExtExe, ignoreErrors: true })
  } catch {
    // A not-ready drive (D:\) or similar must not abort the rest of PATH.
    return false
  }
}

const checkExeSync = (file, pathExtExe) => {
  try {
    return isexeSync(file, { pathExt: pathExtExe, ignoreErrors: true })
  } catch {
    return false
  }
}

const which = async (cmd, opt = {}) => {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt)
  const found = []

  for (const envPart of pathEnv) {
    const p = getPathPart(envPart, cmd)

    for (const ext of pathExt) {
      const withExt = p + ext
      const is = await checkExe(withExt, pathExtExe)
      if (is) {
        if (!opt.all) {
          return withExt
        }
        found.push(withExt)
      }
    }
  }

  if (opt.all && found.length) {
    return found
  }

  if (opt.nothrow) {
    return null
  }

  throw getNotFoundError(cmd)
}

const whichSync = (cmd, opt = {}) => {
  const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt)
  const found = []

  for (const pathEnvPart of pathEnv) {
    const p = getPathPart(pathEnvPart, cmd)

    for (const ext of pathExt) {
      const withExt = p + ext
      const is = checkExeSync(withExt, pathExtExe)
      if (is) {
        if (!opt.all) {
          return withExt
        }
        found.push(withExt)
      }
    }
  }

  if (opt.all && found.length) {
    return found
  }

  if (opt.nothrow) {
    return null
  }

  throw getNotFoundError(cmd)
}

module.exports = which
which.sync = whichSync
