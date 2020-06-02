# detached-navigation

[![npm](https://img.shields.io/npm/v/detached-navigation)](https://www.npmjs.com/package/detached-navigation#top)
[![Build Status](https://travis-ci.org/prantlf/detached-navigation.svg?branch=master)](https://travis-ci.org/prantlf/detached-navigation)
[![codecov](https://codecov.io/gh/prantlf/detached-navigation/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/detached-navigation)
[![codebeat badge](https://codebeat.co/badges/9d85c898-df08-42fb-8ab9-407dc2ce2d22)](https://codebeat.co/projects/github-com-prantlf-detached-navigation-master)
[![Dependency Status](https://david-dm.org/prantlf/detached-navigation.svg)](https://david-dm.org/prantlf/detached-navigation)
[![devDependency Status](https://david-dm.org/prantlf/detached-navigation/dev-status.svg)](https://david-dm.org/prantlf/detached-navigation#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Provides mocked location and history objects detached from the browser window. They can help if you need to navigate in your browser application (change the location and history), but you cannot afford changing the window location.

Features:

* Standard [`window`](#browser), [`location`](#location), [`history`](#history) and [`document`](#document) interfaces, no new API to learn.
* Zero deviations from the native behavior, except for [`location.reload`](#location).
* Applicable in both web browser and [Node.js].
* Detaching (mocking) functions for `window` and `Backbone` provided.
* All-in-one bundle and separate bundles for the three [API] functions.
* Module integration with ES6, CJS and IIFE formats.
* Small bundle sizes: all-in-one 11.3 kB, 5.1 kB, 1.6 kB, the [`Browser`] alone: 7.7 kB, 3.4 kB, 1.3 kB (normal, minified, gzipped).
* TypeScript declarations included.
* No dependencies.

Usage scenarios:

* Tests of SPA. If you verify navigation by tests running on the same page, you cannot cause the location changes to leave the testing page.
* Embedded components. If you embed a component, which performs page navigations, in other page, you cannot let the embedded location changes disturb the parent window location.

The [`Browser`] object can serve as an abstraction that you supply to your application, or component for navigation purposes to swap the functionality of the global `window` object. (Not the rest of the `window` functionality, of course, which would need other abstractions.)

You can continue using the standard and familiar [API] to navigate in both native or detached (mocked) modes.

## Synopsis

```js
import { createDetachedBrowser, detachWindowHistory } from 'detached-navigation'
// Create a browser object with the navigation interface of the window.
const browser = createDetachedBrowser()
// Let changes to location and history occur only in the browser object.
const reattachWindowHistory = detachWindowHistory(window, browser)
// Start listening to the detached location changes.
window.addEventListener('popstate', () => console.log(window.location.href))
// Push a location change to the detached history.
window.pushState({}, 'Test', 'http://localhost/test')
// Go back detached to the previous location, triggering the navigating event.
window.history.back()
// Return the navigation functionality to their original objects.
reattachWindowHistory()
```

```js
import { createDetachedBrowser, detachBackboneHistory } from 'detached-navigation'
// Let a component navigate with Backbone.history detached from window.
detachBackboneHistory(Backbone.history, createDetachedBrowser())
// Start listening to the detached route navigation.
Backbone.history.on('route', () => console.log(Backbone.history.fragment))
// Navigate detached to a specific route, triggering the routing event.
Backbone.history.navigate('test', { trigger: true })
```

## Installation

Make sure that you have installed [Node.js]. Use your favourite package manager ([NPM], [Yarn] or [PNPM]) to add the `detached-navigation` module to your project. Add `-D` on the command line if you want to add the script to a bundle.

```
npm i detached-navigation
yarn add detached-navigation
pnpm i detached-navigation
```

### Node.js and Bundling

If you write a ES6 module for a bundler, import the exported functions your preferred way:

```js
import {
  createDetachedBrowser, detachWindowHistory, detachBackboneHistory
} from 'detached-navigation'

import createDetachedBrowser from 'detached-navigation/dist/detached-browser'
import detachWindowHistory from 'detached-navigation/dist/detach-window'
import detachBackboneHistory from 'detached-navigation/dist/detach-backbone'
```

If you write a CJS module, either for Node.js or for a bundler, require the exported functions your preferred way:

```js
const {
  createDetachedBrowser, detachWindowHistory, detachBackboneHistory
} = require('detached-navigation')

const createDetachedBrowser = require('detached-navigation/dist/detached-browser.cjs')
const detachWindowHistory = require('detached-navigation/dist/detach-window.cjs')
const detachBackboneHistory = require('detached-navigation/dist/detach-backbone.cjs')
```

### Plain Web Page

If you write a plain HTML page, load the script with your chosen global exports from CDN or from the local filesystem:

```html
<script src=https://unpkg.com/detached-navigation@0.0.2/dist/index.iife.min.js></script>
<script>
  const {
    createDetachedBrowser, detachWindowHistory, detachBackboneHistory
  } = detachedNavigation
</script>

<script src=node_modules/detached-navigation/dist/detached-browser.iife.min.js></script>
<script src=node_modules/detached-navigation@/dist/detach-window.iife.min.js></script>
<script src=node_modules/detached-navigation@/dist/detach-backbone.iife.min.js></script>
```

| script name prefix | export and its global name in `window`               |
|--------------------|------------------------------------------------------|
| `index`            | object `detachedNavigation` with the tree keys below |
| `detached-browser` | function `createDetachedBrowser`                     |
| `detach-window`    | function `detachWindowHistory`                       |
| `detach-backbone`  | function `detachBackboneHistory`                     |

Alternatively, you can import the script from CDN or from the local filesystem to an ES6 module on a plain HTML page:

```html
<script type=module>
import {
  createDetachedBrowser, detachWindowHistory, detachBackboneHistory
} from 'https://unpkg.com/detached-navigation@0.0.2/dist/index.min.mjs'

import createDetachedBrowser from
  './node_modules/detached-navigation/dist/detached-browser.min.mjs'
import detachWindowHistory from
  './node_modules/detached-navigation/dist/detach-window.min.mjs'
import detachBackboneHistory from
  './node_modules/detached-navigation/dist/detach-backbone.min.mjs'
</script>
```

## API

The [`Browser`] object provided by this package implements a subset of the interface of the global `window` object, which takes part in page navigation. No other functionality. It covers the following scenarios:

* Assigning to [`browser.location`](#location) and its properties like `href` or `hash`, and reading their values.
* Calling methods of [`browser.location`](#location) like `assign` or `replace`.
* Modifying the history by [`browser.history`](#history) methods `pushState` and `replaceState`.
* Traversing the history by [`browser.history`](#history) methods `back`, `forward` and `go`.
* Listening to [`browser`](#browser) events `popstate` and `hashchange`.
* Accessing the page title by [`browser.document.title`](#document).

A [`Browser`] instance and the global `window` are meant to be replaceable without the application or a component noticing a difference. In regards of the navigation functionality, of course. There is one exception - the method `browser.location.reload`. It does not reload the page; it just dispatches the `popstate` event on the [`Browser`] instance.

This package exports functions to create a [`Browser`] instance and to detach the navigation functionality from the original `window` or `Backbone` objects. Detaching methods return a function that can be used to re-attach the original location and history functionality. If you write an application from the scratch, you should perform the navigation using a [`Browser`] instance, which you initialize either to `window` or to a [`Browser`] instance depending on the target scenario.

### createDetachedBrowser

Creates a new [`Browser`] instance. It can be used for a (mocked) navigation detached from the web page, or it can detach the native location ahd history in `window` or `Backbone`.

```js
function createDetachedBrowser(
  window?: Window, // the object to read the initial state, title and url from
  state?: object,  // the current history state, history.state by default
  title?: string,  // the current document title, document.title by default
  url?: string     // the current location, location.href by default
): Browser         // the object with the navigation interface like window
```

If the `window` object is not supplied, the global `window` will be tried. If other parameters are missing, their values will be filled from the current `window` state. If no parameters are provided and no global `window` is available, the initial location will be set to `{ state: null, title: 'Untitled', url: 'detached://default' }`.

### detachWindowHistory

Detaches the native navigation from the `window` object and replaces it by the navigation using the [`Browser`] instance. Returns a function to undo this operation.

```js
function detachWindowHistory(
  window: Window,  // the window object to detach the location and history from
  browser: Browser // the object with the navigation interface like window
): () => {}        // function for re-attaching the original location and history
```

### detachBackboneHistory

Detaches the native routing from the `Backbone.history` object and replaces it by the navigation using the [`Browser`] instance. Returns a function to undo this operation.

```js
function detachBackboneHistory(
  history: Bacbone.History, // the Backbone.history object to detach from window
  browser: Browser          // the object with the navigation interface like window
): () => {}                 // function for re-attaching the original history
```

### Browser

The object returned by [`createDetachedBrowser`] offers a subset of the interface of `window`, [`Location`], [`History`] and [`Document`], which is needed for the navigation.

```js
class Browser {
  addEventListener(eventName: string, listener: Listener): void
  removeEventListener(eventName: string, listener: Listener): void
  dispatchEvent(event: Event): boolean
  location: Location
  history: History
  document: Document
  onpopstate: EventListener
  onhashchange: EventListener
}
```

See ["Working with the History API" at MDN] for more information.

### Location

The object returned by `browser.location` from [`Browser`] with the interface of `window.location`. It has the same behaviour as its native original, but works detached from the original on the web page. Only the `location.reload` method behaves differently. It does not reload the page; it just dispatches the `popstate` event.

```js
class Location {
  assign(url: string): void
  reload(): void
  replace(url: string): void
  toString(): string
  hash: string
  host: string
  hostname: string
  href: string
  origin: string
  pathname: string
  port: string
  protocol: string
  search: string
}
```

See [`Location` at MDN] for more information.

### History

The object returned by `browser.history` from [`Browser`] with the interface of `window.history`. It has the same behaviour as its native original, but works detached from the original on the web page.

```js
class History {
  back(): void
  forward(): void
  go(offset: number): void
  pushState(state: object, title: string, url: string): void
  replaceState(state: object, title: string, url: string): void
  length: number
  state: object
}
```

See [`History` at MDN] for more information.

### Document

The object returned by `browser.document` from [`Browser`] with the interface of `window.document`. But only the part needed for navigation. Otherwise it has the same behaviour as its native original, but works detached from the original on the web page.

```js
class Document {
  title: string
}
```

See [`Document.title` at MDN] for more information.

## Build

Make sure that you have installed [Node.js] 10 or newer, [PNPM] 5 or newer and [Make] 3.80 or newer. Clone the repository and run the build including the module installation, lint and test phases:

```
git clone https://github.com/prantlf/detached-navigation.git
cd detached-navigation
make prepare lint test
```

### Maintenance

Distribution and test files will be generated in `dist` and `test` directories. During the development, ensure proper coding standard and verify the changes:

```
make fix test
```

When you check the test coverage after running the target `test`, you will need to rebuild the output files, because the `esm` plugin caches them and would not allow `nyc` to supply the instrumented ones:

```
make clean coverage
```

Before releasing a new version, a clean re-built and re-test including code coverage should be performed:

```
make new
```

### Upgrade

Development module dependencies declared in [`package.json`] should be regularly upgraded to the most recent versions and this package rebuilt to check and adapt to their changes:

```
make upgrade
```

## License

Copyright (c) 2020 Ferdinand Prantl

Licensed under the MIT license.

[Node.js]: https://nodejs.org/
[NPM]: https://docs.npmjs.com/cli/npm
[Yarn]: https://classic.yarnpkg.com/docs/cli/
[PNPM]: https://pnpm.js.org/pnpm-cli
[Make]: https://www.gnu.org/software/make/
[API]: #api
[`createDetachedBrowser`]: #createdetachedbrowser
[`Browser`]: #browser
[`Location`]: #location
[`History`]: #history
[`Document`]: #document
[`package.json`]: package.json
["Working with the History API" at MDN]: https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API
[`Location` at MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Location
[`History` at MDN]: https://developer.mozilla.org/en-US/docs/Web/API/History
[`Document.title` at MDN]: https://developer.mozilla.org/en-US/docs/Web/API/Document/title
