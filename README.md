CommonForm.org
==============

Web interface for the composition, verification, and sharing of form contracts

Architecture
------------

The interface utilizes [React][React] and [Bootstrap][Bootstrap]. Data is shuttled to and from React components via [Reflux][Reflux]. Components and [`commonform-*` modules][commonform-] make heavy use of [Immutable.js][Immutable.js] Maps and Lists. This facilitates fast identity checking across render passes in [`shouldComponentUpdate`][shouldComponentUpdate] with a [mixin][mixin]. A similar technique, [naively implemented][commonform-merkleize], avoids re-hashing unmodified sub-forms during each rendering pass. Microsoft Word `.docx` export is made possible by [`commonform-docx`][commonform-docx], which in turn utilizes [JSZip][JSZIP].

Development
-----------

To build a production distribution in `./application`, run `npm install` to install dependencies from [npm][npm], then run `make`.

The [Makefile](./Makefile) utilizes [Less][Less] to generate style sheets and [Browserify][Browserify] to pack a monolithic glob of JavaScript. Use `make watch` to re-generate JavaScript and source maps more quickly as you make changes.

There are many fewer tests than I'd like. What there is you can run with `npm test`.

All JavaScript passes provided [JSHint][JSHint] and [JSCS][JSCS] configurations. If you'd like to submit changes, please make sure your commit passes `npm run pre-commit`, perhaps by creating a [Git hook][Git Hooks]. [Travis CI][Travis CI] runs the same checks.

[Bootstrap]: http://getbootstrap.com
[Browserify]: http://browserify.org
[commonform-docx]: https://github.com/commonform/commonform-docx
[commonform-]: https://www.npmjs.com/search?q=commonform-
[commonform-merkleize]: https://github.com/commonform/commonform-merkleize
[Git Hooks]: http://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
[Immutable.js]: http://facebook.github.io/immutable-js/
[JSCS]: http://jscs.info/
[JSHint]: http://jshint.com/
[JSZip]: https://stuk.github.io/jszip/
[Less]: http://lesscss.org/
[mixin]: https://www.npmjs.com/package/react-immutable-render-mixin
[npm]: https://npmjs.com
[React]: https://facebook.github.io/react/
[Reflux]: https://github.com/spoike/refluxjs
[shouldcomponentupdate]: http://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate
[Travis CI]: https://travis-ci.org/commonform/commonform.org
