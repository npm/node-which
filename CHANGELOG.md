# Changelog

## [6.0.1](https://github.com/npm/node-which/compare/v6.0.0...v6.0.1) (2026-02-10)
### Dependencies
* [`bd22353`](https://github.com/npm/node-which/commit/bd223532f5f86a2e8961941b7868cb72a77e0f4e) [#168](https://github.com/npm/node-which/pull/168) bump isexe from 3.1.5 to 4.0.0 (#168) (@dependabot[bot])
### Chores
* [`fc4c209`](https://github.com/npm/node-which/commit/fc4c209e09061e99e3d30204178c422750e4f61a) [#163](https://github.com/npm/node-which/pull/163) bump @npmcli/eslint-config from 5.1.0 to 6.0.0 (#163) (@dependabot[bot])
* [`46b25d7`](https://github.com/npm/node-which/commit/46b25d765671fdbd88e0779ff5bcee5798ac9151) [#165](https://github.com/npm/node-which/pull/165) bump @npmcli/template-oss from 4.28.0 to 4.28.1 (#165) (@dependabot[bot], @npm-cli-bot)

## [6.0.0](https://github.com/npm/node-which/compare/v5.0.0...v6.0.0) (2025-10-22)
### ⚠️ BREAKING CHANGES
* align to npm 11 node engine range (#161)
### Bug Fixes
* [`cf1a1bc`](https://github.com/npm/node-which/commit/cf1a1bc32652456b317c2fdbd957fe4c56f9bbca) [#161](https://github.com/npm/node-which/pull/161) align to npm 11 node engine range (#161) (@owlstronaut)
### Chores
* [`66cf669`](https://github.com/npm/node-which/commit/66cf669cc6c92ddf4dd128ca2ef1417d0c8f01ae) [#160](https://github.com/npm/node-which/pull/160) bump @npmcli/template-oss from 4.26.0 to 4.27.1 (#160) (@dependabot[bot], @npm-cli-bot)

## [5.0.0](https://github.com/npm/node-which/compare/v4.0.0...v5.0.0) (2024-10-01)
### ⚠️ BREAKING CHANGES
* `which` now supports node `^18.17.0 || >=20.5.0`
### Bug Fixes
* [`77aba08`](https://github.com/npm/node-which/commit/77aba0830270333907d00b5d550df9afa7348497) [#151](https://github.com/npm/node-which/pull/151) align to npm 10 node engine range (@reggi)
### Chores
* [`5d49ed0`](https://github.com/npm/node-which/commit/5d49ed025f39923a3b2b898fda3ee825f71b1cc2) [#151](https://github.com/npm/node-which/pull/151) run template-oss-apply (@reggi)
* [`8a2d8e0`](https://github.com/npm/node-which/commit/8a2d8e0be67bc78f38895c9e8adfe6a749ff22be) [#149](https://github.com/npm/node-which/pull/149) bump @npmcli/eslint-config from 4.0.5 to 5.0.0 (@dependabot[bot])
* [`d4009b2`](https://github.com/npm/node-which/commit/d4009b202b555838a2d98f39da36d7c36aca3896) [#138](https://github.com/npm/node-which/pull/138) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)
* [`1a07cd7`](https://github.com/npm/node-which/commit/1a07cd710351a3d5d608fff13fccebeae4cddbfe) [#150](https://github.com/npm/node-which/pull/150) postinstall for dependabot template-oss PR (@hashtagchris)
* [`45f3aa8`](https://github.com/npm/node-which/commit/45f3aa80a0495348797383419cacef6349b9c082) [#150](https://github.com/npm/node-which/pull/150) bump @npmcli/template-oss from 4.23.1 to 4.23.3 (@dependabot[bot])

## [4.0.0](https://github.com/npm/node-which/compare/v3.0.1...v4.0.0) (2023-08-29)

### ⚠️ BREAKING CHANGES

* support for node 14 has been removed

### Bug Fixes

* [`c7122cd`](https://github.com/npm/node-which/commit/c7122cd2b1738214f7ce43e854992725d7ac0a65) [#105](https://github.com/npm/node-which/pull/105) drop node14 support (@wraithgar)
* [`0083d3c`](https://github.com/npm/node-which/commit/0083d3c14af23f2a7eb8f400863c3c1b9028fa31) [#105](https://github.com/npm/node-which/pull/105) update for breaking isexe api (@wraithgar)
* [`00b5cda`](https://github.com/npm/node-which/commit/00b5cda3e3295bd55f3886d25cc5a8f879a64b5a) [#106](https://github.com/npm/node-which/pull/106) replace reduce with flatMap (#106) (@green961)

### Dependencies

* [`22d1c84`](https://github.com/npm/node-which/commit/22d1c845d390edc410700a4202d52a6680cf6f16) [#105](https://github.com/npm/node-which/pull/105) Bump isexe from 2.0.0 to 3.1.1

## [3.0.1](https://github.com/npm/node-which/compare/v3.0.0...v3.0.1) (2023-05-01)

### Bug Fixes

* [`c3a543e`](https://github.com/npm/node-which/commit/c3a543e589a3ac7876df0fc6927f24d74065a267) [#100](https://github.com/npm/node-which/pull/100) check lower case extensions in windows (#100) (@wraithgar)

### Documentation

* [`ba58b51`](https://github.com/npm/node-which/commit/ba58b51805e001c7ea706bb45e6bee1b2be41673) [#97](https://github.com/npm/node-which/pull/97) Replace binary `which` with `node-which` in README.md (#97) (@DevDengChao)

## [3.0.0](https://github.com/npm/node-which/compare/v2.0.2...v3.0.0) (2022-11-01)

### ⚠️ BREAKING CHANGES

* refactored with the following breaking changes
    - callback has been removed from the async interface, it is now
    `Promise` only
    - `which` is now compatible with the following semver range for node:
    `^14.17.0 || ^16.13.0 || >=18.0.0
    - cli now ignores any arguments after `--`

### Features

* [`8b0187c`](https://github.com/npm/node-which/commit/8b0187ceab57b0814ad6a77a5706319ffa5bf103) add @npmcli/template-oss and modernize (#86) (@lukekarrys)

## 2.0.2

* Rename bin to `node-which`

## 2.0.1

* generate changelog and publish on version bump
* enforce 100% test coverage
* Promise interface

## 2.0.0

* Parallel tests, modern JavaScript, and drop support for node < 8

## 1.3.1

* update deps
* update travis

## v1.3.0

* Add nothrow option to which.sync
* update tap

## v1.2.14

* appveyor: drop node 5 and 0.x
* travis-ci: add node 6, drop 0.x

## v1.2.13

* test: Pass missing option to pass on windows
* update tap
* update isexe to 2.0.0
* neveragain.tech pledge request

## v1.2.12

* Removed unused require

## v1.2.11

* Prevent changelog script from being included in package

## v1.2.10

* Use env.PATH only, not env.Path

## v1.2.9

* fix for paths starting with ../
* Remove unused `is-absolute` module

## v1.2.8

* bullet items in changelog that contain (but don't start with) #

## v1.2.7

* strip 'update changelog' changelog entries out of changelog

## v1.2.6

* make the changelog bulleted

## v1.2.5

* make a changelog, and keep it up to date
* don't include tests in package
* Properly handle relative-path executables
* appveyor
* Attach error code to Not Found error
* Make tests pass on Windows

## v1.2.4

* Fix typo

## v1.2.3

* update isexe, fix regression in pathExt handling

## v1.2.2

* update deps, use isexe module, test windows

## v1.2.1

* Sometimes windows PATH entries are quoted
* Fixed a bug in the check for group and user mode bits. This bug was introduced during refactoring for supporting strict mode.
* doc cli

## v1.2.0

* Add support for opt.all and -as cli flags
* test the bin
* update travis
* Allow checking for multiple programs in bin/which
* tap 2

## v1.1.2

* travis
* Refactored and fixed undefined error on Windows
* Support strict mode

## v1.1.1

* test +g exes against secondary groups, if available
* Use windows exe semantics on cygwin & msys
* cwd should be first in path on win32, not last
* Handle lower-case 'env.Path' on Windows
* Update docs
* use single-quotes

## v1.1.0

* Add tests, depend on is-absolute

## v1.0.9

* which.js: root is allowed to execute files owned by anyone

## v1.0.8

* don't use graceful-fs

## v1.0.7

* add license to package.json

## v1.0.6

* isc license

## 1.0.5

* Awful typo

## 1.0.4

* Test for path absoluteness properly
* win: Allow '' as a pathext if cmd has a . in it

## 1.0.3

* Remove references to execPath
* Make `which.sync()` work on Windows by honoring the PATHEXT variable.
* Make `isExe()` always return true on Windows.
* MIT

## 1.0.2

* Only files can be exes

## 1.0.1

* Respect the PATHEXT env for win32 support
* should 0755 the bin
* binary
* guts
* package
* 1st
