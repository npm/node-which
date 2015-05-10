# What is this?

The "which" util from npm's guts.

Finds the first instance of a specified executable in the PATH
environment variable.  Does not cache the results, so `hash -r` is not
needed when the PATH changes.

# Usage

```
var which = require('which')

which('ls', function(err, path) {
  if(err) {
    console.log('Error finding ls: ' + err.message)
  } else {
    console.log('found ls at ' + path)
  }
})

try {
  var path = which.sync('ls')
  console.log('found ls at ' + path)
} catch(e) {
  console.log('cannot find ls: ' + e.message)
}
```
