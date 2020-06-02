import * as Backbone from 'backbone'
import createDetachedBrowser from '../dist/detached-browser'
import detachWindowHistory from '../dist/detach-window'
import detachBackboneHistory from '../dist/detach-backbone'
import {
  createDetachedBrowser as createDetachedBrowser2,
  detachWindowHistory as detachWindowHistory2,
  detachBackboneHistory as detachBackboneHistory2
} from '../dist/index'

const window = { document: {} }

exports['test type declarations of index'] = assert => {
  assert.equal(typeof createDetachedBrowser2, 'function', 'createDetachedBrowser is exported')
  assert.equal(typeof detachWindowHistory2, 'function', 'detachWindowHistory is exported')
  assert.equal(typeof detachBackboneHistory2, 'function', 'detachBackboneHistory is exported')
}

exports['test type declarations of detached-browser'] = assert => {
  const browser = createDetachedBrowser()
  assert.equal(typeof browser, 'object', 'returns a result')
  createDetachedBrowser(window)
  createDetachedBrowser(window, {})
  createDetachedBrowser(window, {}, 'Title')
  createDetachedBrowser(window, {}, 'Title', 'scheme://host')
  assert.ok(true, 'accepts declared parameters')
}

exports['test type declarations of detach-window'] = assert => {
  const undo = detachWindowHistory(window, createDetachedBrowser())
  assert.equal(typeof undo, 'function', 'accepts declared parameters and returns a result')
}

exports['test type declarations of detach-backbone'] = assert => {
  const undo = detachBackboneHistory(Backbone.history, createDetachedBrowser())
  assert.equal(typeof undo, 'function', 'accepts declared parameters and returns a result')
}

if (require.main === module) require('test').run(exports) // eslint-disable-line @typescript-eslint/no-var-requires
