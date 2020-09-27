# which

Like the unix `which` utility.

Finds the first instance of a specified executable in the PATH
environment variable.  Does not cache the results, so `hash -r` is not
needed when the PATH changes.

## USAGE

```javascript
const which = require('which')

const resolvedPath = await which('node') // Also supports callback

console.log(resolvedPath)

const resolved = which.sync('node', {nothrow: true, path: someOtherPath}) // Override PATH and PATHEXT by setting `path`

console.log(resolved)
```

## CLI USAGE

Same as the BSD `which(1)` binary.

```
usage: which [-as] program ...
```

## OPTIONS

You may pass an options object as the second argument.

- `path`: Use instead of the `PATH` environment variable.
- `pathExt`: Use instead of the `PATHEXT` environment variable.
- `all`: Return all matches, instead of just the first one.  Note that
  this means the function returns an array of strings instead of a
  single string.
