- [x] watch the [egghead.io][egghead] series [How to Write an Open Source JavaScript Library][egghead series]; it is
  extremely useful for any NPM project (OSS or closed-sourced).

- [x] start unit testing right away, [pick your unit testing framework][pick testing framework]

- [x] start linting code to prevent obvious problems, like misspelled variable.
  [eslint][eslint], [jshint][jshint], [jscs][jscs] or all of them together
  [gulp-lint-everything][gulp-lint-everything]

- [x] run linting and unit tests on each commit locally. [pre-git][pre-git], [ghooks][ghooks]

- [ ] \[maybe] validate commit message using [pre-git][pre-git] or [commitizen][commitizen]
  with [validate-commit-msg][validate-commit-msg]. This enables other tools, like intelligent release notes.

- [x] use logging library to show more information during debugging or verbose mode.
  [debug][debug], [logdown][logdown]

- [ ] check module published size and white list only necessary files, [tutorial][module size]

- [ ] setup a script to reliably update out of date dependencies using [next-update][next-update install]
	- [ ] setup automatic pull requests when newer versions of dependencies appear [greenkeeper.io][greenkeeper]

- [ ] if writing a CLI tool, add a way to check if it is out of date and should be upgraded;
  [update-notifier][update-notifier]

- [ ] scan dependencies and code for known security vulnerabilities. [snyk][snyk], [NodeSecurity][NodeSecurity]

- [ ] write "quick intro" example showing the main feature of your module

- [ ] add CONTRIBUTING.md file with clear guidelines how others can add new features or fix bugs in your
  module. [Atom editor][atom] and [lodash][lodash] have excellent examples to follow. When GitHub finds a
  CONTRIBUTING.md file it [shows a message][contributing] to anyone opening an issue.

- [ ] place most of the public API documentation in README file for simple retrieval. This allows other developers to
  find relevant sections right from the command line [manpm][manpm]
  or by looking up `npm home package-name`

- [ ] set up a proper CLI interface for the `outpost` command

- [ ] include a `help` command for the user to see subcommands and usage

[egghead]: https://egghead.io

[egghead series]: https://egghead.io/series/how-to-write-an-open-source-javascript-library

[pick testing framework]: http://glebbahmutov.com/blog/picking-javascript-testing-framework/

[eslint]: http://eslint.org/

[jshint]: http://jshint.com/docs/

[jscs]: http://jscs.info/

[gulp-lint-everything]: https://github.com/bahmutov/gulp-lint-everything

[pre-git]: https://github.com/bahmutov/pre-git

[ghooks]: https://www.npmjs.com/package/ghooks

[Codacy]: https://codacy.com/

[CodeClimate]: https://codeclimate.com/

[BitHound]: https://www.bithound.io/

[commitizen]: https://www.npmjs.com/package/commitizen

[debug]: https://github.com/visionmedia/debug

[logdown]: https://github.com/caiogondim/logdown

[validate-commit-msg]: https://www.npmjs.com/package/validate-commit-msg

[git-issues]: https://www.npmjs.com/package/git-issues

[travis]: https://travis-ci.org/

[circle]: https://circleci.com/

[badges]: http://glebbahmutov.com/blog/tightening-node-project/

[nodeico]: https://nodei.co/

[david-dm]: https://david-dm.org/

[module size]: http://glebbahmutov.com/blog/smaller-published-NPM-modules/

[semantic-release]: https://github.com/semantic-release/semantic-release

[semver]: http://semver.org/

[semver important]: https://medium.com/javascript-scene/software-versions-are-broken-3d2dc0da0783#.h96ppopx3

[broken semver]: https://www.youtube.com/watch?v=tc2UgG5L7WM

[save-exact]: https://docs.npmjs.com/misc/config#save-exact

[exact-semver]: https://github.com/bahmutov/exact-semver

[next-update install]: https://github.com/bahmutov/next-update#install

[greenkeeper]: http://greenkeeper.io/

[update-notifier]: https://github.com/yeoman/update-notifier

[snyk]: https://www.npmjs.com/package/snyk

[NodeSecurity]: https://nodesecurity.io/

[grunt-nice-package]: https://github.com/bahmutov/grunt-nice-package

[fixpack]: https://github.com/henrikjoreteg/fixpack

[atom]: https://github.com/atom/atom/blob/master/CONTRIBUTING.md

[lodash]: https://github.com/lodash/lodash/blob/master/CONTRIBUTING.md

[contributing]: https://github.com/blog/1184-contributing-guidelines

[xplain]: https://github.com/bahmutov/xplain

[manpm]: https://github.com/bahmutov/manpm

[pluralize]: https://github.com/blakeembrey/pluralize

Source: [npm-module-checklist](https://github.com/bahmutov/npm-module-checklist)
