# Contributing to CommonForm.org

Hooray for you! CommonForm.org could definitely use some help. If you're alright licensing your improvements per the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0), the following introduction to the code is for you.

## Whatsit

[CommonForm.org](https://commonform.org) is a single-page application written in JavaScript and served from filesystem by [NGINX](https://nginx.org) over HTTPS. That application interacts exclusively with the API server, called "the public library", at [api.commonform.org](https://api.commonform.org).

## Framework?

No. Not really. Modules. [npm](https://npmjs.com) modules. Lots of npm modules. [Blame](https://localwiki.org/oakland/javascript) [Oakland](https://localwiki.org/oakland/javascript).

All of the modules get stitched together into one big `browser.js` by [Browserify](https://browserify). The build chain is in a "build" npm run script, which you can find in [package.json](./package.json) within "scripts". You will also see [node-sass][node-sass] for generating CSS.

Rendering is handled by [main-loop][main-loop] with [virtual-dom][virtual-dom], which, if you're not familiar, is a lean, mean, module-y-er kind of virtual DOM rendering utility along the lines of Facebook's [React](https://github.com/reactjs). I started in React, but, well ... ask me about it over coffee sometime. No hard feelings, but no React no more.

All of the state for the application, which is mostly a [Common Form](https://npmjs.com/packages/commonform-validate), lives in a global `state` object. That state gets passed down to various rendering functions that return virtual DOM trees. Changes to state happen by triggering events on a global [event emitter][event-emitter], which in turn mutates the global state and tells main-loop to compare the new virtual DOM to the existing DOM and render any changes. The `emit` function of the global event emitter gets passed down with state. A global boolean lock prevents changes to the global state while changes are being rendered. Crude, but effective.

## Dendrology

Common Forms are dead-simple, recursive data structures, or JSON trees. Basically:

```json
{ "content": [
    "Some text. Cannot start with space. ",
    { "use": "A Defined Term" },
    { "definition": "Another Defined Term" },
    { "blank": "Fill-in-the-Blank Label" },
    { "reference": "Referenced Heading" },
    { "heading": "Referenced Heading",
      "form": {
        "content": [ "Some more text. Set conspicuously!" ],
        "conspicuous": "yes" } },
    "Text at the end of a form cannot end with space."] }
```

Common Forms don't inherently separate inline content, like text and definitions, from child forms, but CommonForm.org uses [commonform-group-series][commonform-group-series] to bunch contiguous inline elements and child forms into "paragraphs" and "series", respectively. Paragraphs are rendered as `p` tags. Forms, top-level or nested, are always `section` tags. The markup is pretty clean, if I don't say so myself.

In addition to the Common Form being edited, CommonForm.org derives two additional trees from the Common Form whenever it changes:

1. A tree of cryptographic digests, a [Merkle tree](https://en.wikipedia.org/wiki/Merkle_Tree), of the same shape as the Common Form.

2. A tree of [Common Form annotations](https://npmjs.com/packages/commonform-annotations), also arranged in a tree of the same shape as the Common Form

"Same shape" means that the same series of keys used to fetch a particular child form from the Common Form can be used to fetch an object containing the relevant digest and annotations for that child:

```javascript
state.data.children[0] // A child form
require('keyarray').get(state.data, [ 'children', 0 ]) // Same child form
state.merkle.children[0].digest // That child form's digest
state.merkle.children[0].annotations // Annotations to that child form
```

Rendering functions pass down only the relevant parts of these trees to other rendering functions, together with a `path` array that contains all the keys needed to reach that data from the top of the trees. Event handlers created by rendering functions use the `path` properties of their states to create the right arguments to `emit` to mutate the global state.

## History

On load, the application hits the public library for a hard-coded form containing a welcome message. Once loaded, that form is inserted into `state` and main-loop renders.

Any change to the form triggers:

1. A change to the address show in the address bar, reflecting the digest of the current Common Form in `state`, via a `pushState` call that stores the digest of the current Common Form.

2. Caching of the Common Form's content, by digest, in [IndexedDB][indexed-db], via [level.js][level.js] and [level-lru-cache][level-lru-cache].

When the user hits the back button, the app checks to see whether the previous state of the form is still cached. If it's cached, it gets injected into `state`. Otherwise, the app hits the public API.

## Hacking

Basically:

```shellsession
$ git clone https://github.com/commonform/commonform.org
$ cd commonform.org
$ npm install
$ npm run build
$ npm start
```

To rebuild the JavaScript bundle much faster on each code change:

```shellsession
$ npm run watch
```

[commonform-group-series]: https://npmjs.com/packages/commonform-group-series
[event-emitter]: https://nodejs.org/api/events.html
[indexed-db]: http://www.w3.org/TR/IndexedDB/
[level-lru-cache]: https://npmjs.com/packages/level-lru-cache
[level.js]: https://npmjs.com/packages/level.js
[main-loop]: https://npmjs.com/packages/main-loop
[node-sass]: https://npmjs.com/packages/node-sass
[virtual-dom]: https://npmjs.com/packages/virtual-dom
