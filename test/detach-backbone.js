import createDetachedBrowser from '../lib/detached-browser'
import detachBackboneHistory from '../lib/detach-backbone'

exports['test detach-backbone: re-attaches the location and history'] = assert => {
  const Backbone = { history: {} }
  const undo = detachBackboneHistory(Backbone.history, createDetachedBrowser())
  assert.equal(typeof undo, 'function', 'returns an undoing function')
  undo()
  assert.equal(Backbone.history.location, undefined, 're-attaches original location')
  assert.equal(Backbone.history.history, undefined, 're-attaches original history')
}

if (require.main === module) { require('test').run(exports) }
