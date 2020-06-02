import createDetachedBrowser from '../lib/detached-browser'
import detachWindowHistory from '../lib/detach-window'

exports['test detach-window: transfers the location and history'] = assert => {
  const window = {
    location: {},
    history: {},
    document: {}
  }
  const browser = createDetachedBrowser()
  detachWindowHistory(window, browser)
  assert.equal(window.location.href, browser.location.href, 'replaces location')
  assert.equal(window.history.state, browser.history.state, 'replaces history state')
  assert.equal(window.history.length, browser.history.length, 'replaces history length')
  assert.equal(window.document.title, browser.document.title, 'replaces document title')
}

exports['test detach-window: detaches the location and history'] = assert => {
  let added = 0
  let removed = 0
  let dispatched = 0
  let getpopstate = false
  let setpopstate = false
  let gethashchange = false
  let sethashchange = false
  let gettitle = false
  let settitle = false
  const window = {
    location: {},
    history: {},
    document: {
      get title () { return (gettitle = true) },
      set title (value) { settitle = true }
    },
    addEventListener (eventName, handler, options) { ++added },
    removeEventListener (eventName, handler, options) { ++removed },
    dispatchEvent (event) { ++dispatched },
    get onpopstate () { return (getpopstate = true) },
    set onpopstate (value) { setpopstate = true },
    get onhashchange () { return (gethashchange = true) },
    set onhashchange (value) { sethashchange = true }
  }
  detachWindowHistory(window, createDetachedBrowser())
  window.document.title = `${window.document.title} Test`
  assert.ok(!gettitle, 'shadows the original title getter')
  assert.ok(!settitle, 'shadows the original title setter')
  const onevent = () => {}
  window.onpopstate = window.onpopstate || onevent
  window.onhashchange = window.onhashchange || onevent
  assert.ok(!getpopstate, 'shadows the original onpopstate getter')
  assert.ok(!setpopstate, 'shadows the original onpopstate setter')
  assert.ok(!gethashchange, 'shadows the original onhashchange getter')
  assert.ok(!sethashchange, 'shadows the original onhashchange setter')
  assert.equal(window.onpopstate, onevent, 'sets onpopstate handler')
  assert.equal(window.onhashchange, onevent, 'sets onhashchange handler')
  window.addEventListener('popstate', onevent)
  window.addEventListener('hashchange', onevent)
  window.addEventListener('event', onevent)
  assert.equal(added, 1, 'addEventListener passes through events other than popstate and hashchange')
  window.dispatchEvent({ type: 'popstate' })
  window.dispatchEvent({ type: 'hashchange', cancelable: true, defaultPrevented: true })
  window.dispatchEvent({ type: 'event' })
  assert.equal(dispatched, 1, 'dispatchEvent passes through events other than popstate and hashchange')
  window.removeEventListener('popstate', onevent)
  window.removeEventListener('hashchange', onevent)
  window.removeEventListener('event', onevent)
  assert.equal(removed, 1, 'removeEventListener passes through events other than popstate and hashchange')
}

exports['test detach-window: re-attaches the location and history'] = assert => {
  const window = { document: {} }
  const undo = detachWindowHistory(window, createDetachedBrowser())
  assert.equal(typeof undo, 'function', 'returns an undoing function')
  undo()
  assert.equal(window.location, undefined, 're-attaches original location')
  assert.equal(window.history, undefined, 're-attaches original history')
  assert.equal(window.document.title, undefined, 'restores document title')
  assert.equal(window.addEventListener, undefined, 're-attaches original addEventListener')
  assert.equal(window.removeEventListener, undefined, 're-attaches original removeEventListener')
  assert.equal(window.dispatchEvent, undefined, 're-attaches original dispatchEvent')
}

if (require.main === module) { require('test').run(exports) }
