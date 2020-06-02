import createDetachedBrowser from '../lib/detached-browser'

exports['test detached-browser: provides defaults for the location and history'] = assert => {
  const browser = createDetachedBrowser()
  assert.equal(browser.location.href, 'detached://default', 'initializes location')
  assert.equal(browser.history.state, null, 'initializes history state')
  assert.equal(browser.document.title, 'Untitled', 'initializes document title')
}

exports['test detached-browser: inherits the current location and history'] = assert => {
  const state = {}
  const window = {
    location: { href: 'custom://test' },
    history: { state },
    document: { title: 'Test' }
  }
  const browser = createDetachedBrowser(window)
  assert.equal(browser.location.href, 'custom://test', 'initializes location')
  assert.equal(browser.history.state, state, 'initializes history state')
  assert.equal(browser.document.title, 'Test', 'initializes document title')
}

exports['test detached-browser: sets the current location and history explicitly'] = assert => {
  const state = {}
  const browser = createDetachedBrowser(null, state, 'Test', 'custom://test')
  assert.equal(browser.location.href, 'custom://test', 'initializes location')
  assert.equal(browser.history.state, state, 'initializes history state')
  assert.equal(browser.document.title, 'Test', 'initializes document title')
}

exports['test detached-browser: maintains the document title'] = assert => {
  const browser = createDetachedBrowser()
  browser.document.title = 'Test'
  assert.equal(browser.document.title, 'Test', 'sets document title')
}

exports['test detached-browser: implements the event emitter interface'] = assert => {
  let event = 0
  let event2 = 0
  const onevent = () => { ++event }
  const onevent2 = () => { ++event2 }
  const browser = createDetachedBrowser()
  browser.addEventListener('event', onevent)
  browser.removeEventListener('unknown', onevent)
  browser.removeEventListener('event', onevent2)
  browser.dispatchEvent({ type: 'event' })
  browser.addEventListener('event', onevent2)
  browser.dispatchEvent({ type: 'event' })
  browser.dispatchEvent({ type: 'unknown' })
  browser.removeEventListener('event', onevent2)
  browser.dispatchEvent({ type: 'event' })
  browser.removeEventListener('event', onevent)
  browser.dispatchEvent({ type: 'event' })
  assert.equal(event, 3, 'adds and removes an event handler')
  assert.equal(event2, 1, 'adds and removes another event handler')
}

exports['test detached-browser: includes method event handlers'] = assert => {
  const onpopstate = () => {}
  const onhashchange = () => {}
  const browser = createDetachedBrowser()
  browser.onpopstate = onpopstate
  browser.onhashchange = onhashchange
  assert.equal(browser.onpopstate, onpopstate, 'sets onpopstate handler')
  assert.equal(browser.onhashchange, onhashchange, 'sets onhashchange handler')
  browser.onpopstate = null
  browser.onhashchange = null
  assert.equal(browser.onpopstate, null, 'resets onpopstate handler')
  assert.equal(browser.onhashchange, null, 'resets onhashchange handler')
}

exports['test detached-browser: supports the location'] = assert => {
  function PopStateEvent () {
    this.type = 'popstate'
  }
  function HashChangeEvent () {
    this.type = 'hashchange'
  }
  const browser = createDetachedBrowser({ PopStateEvent, HashChangeEvent })
  let popstate = 0
  let hashchange = 0
  const onpopstate = () => { ++popstate }
  const onhashchange = () => { ++hashchange }
  browser.addEventListener('popstate', onpopstate)
  browser.addEventListener('hashchange', onhashchange)
  assert.equal(browser.location.toString(), browser.location.href, 'toString() returns href')
  browser.location = 'test://location'
  assert.equal(browser.location.href, 'test://location', 'sets location')
  browser.location.protocol = 'custom:'
  assert.equal(browser.location.protocol, 'custom:', 'sets protocol')
  browser.location.protocol = 'test'
  assert.equal(browser.location.protocol, 'test:', 'sets protocol without colon')
  browser.location.href = 'http://href'
  assert.equal(browser.location.href, 'http://href/', 'sets href')
  browser.location.port = '1'
  assert.equal(browser.location.port, '1', 'sets port')
  browser.location.host = 'host'
  assert.equal(browser.location.host, 'host:1', 'sets port')
  browser.location.host = 'host2:2'
  assert.equal(browser.location.host, 'host2:2', 'sets host and port')
  browser.location.hostname = 'hostname'
  assert.equal(browser.location.hostname, 'hostname', 'sets hostname')
  assert.equal(browser.location.origin, 'http://hostname:2', 'gets origin')
  browser.location.pathname = '/path'
  assert.equal(browser.location.pathname, '/path', 'sets pathname')
  browser.location.search = '?query'
  assert.equal(browser.location.search, '?query', 'sets search')
  browser.location.search = 'query2'
  assert.equal(browser.location.search, '?query2', 'sets search without question mark')
  browser.location.hash = '#hash'
  assert.equal(browser.location.hash, '#hash', 'sets hash')
  browser.location.hash = 'hash2'
  assert.equal(browser.location.hash, '#hash2', 'sets hash without F sharp')
  assert.equal(browser.location.href, 'http://hostname:2/path?query2#hash2', 'maintains href')
  browser.location.assign('test://location')
  assert.equal(browser.location.href, 'test://location', 'assigns location')
  browser.location.replace('custom://host#hash')
  assert.equal(browser.location.href, 'custom://host#hash', 'replaces location')
  browser.location.reload()
  assert.equal(popstate, 16, 'triggers popstate')
  assert.equal(hashchange, 4, 'triggers hashchange')
}

exports['test detached-browser: navigates using the history'] = assert => {
  function PopStateEvent () {
    this.type = 'popstate'
  }
  const browser = createDetachedBrowser({
    PopStateEvent, location: { href: 'http://localhost' }
  })
  assert.equal(browser.history.length, 1, 'initializes history length')
  let popstate = 0
  const onpopstate = () => { ++popstate }
  browser.addEventListener('popstate', onpopstate)
  const state = {}
  browser.history.pushState(state, '1', 'http://localhost/1')
  assert.equal(browser.history.length, 2, 'updates history length')
  assert.equal(popstate, 0, 'does not trigger popstate')
  assert.equal(browser.location.href, 'http://localhost/1', 'pushes location')
  assert.equal(browser.document.title, '1', 'pushes document title')
  assert.equal(browser.history.state, state, 'pushes history state')
  browser.history.pushState(undefined, undefined, '/2/3')
  assert.equal(browser.history.state, state, 'retains history state')
  assert.equal(browser.location.href, 'http://localhost/2/3', 'pushes relative URL with an absolute path')
  assert.equal(browser.document.title, '1', 'retains document title')
  browser.history.pushState(undefined, undefined, '4')
  assert.equal(browser.location.href, 'http://localhost/2/4', 'pushes relative URL with a relative path')
  browser.history.pushState()
  assert.equal(browser.location.href, 'http://localhost/2/4', 'retains location')
  assert.throws(() => browser.history.pushState(null, undefined, 'https:/localhost'), undefined, 'cross-origin pushing fails')
  const state2 = {}
  browser.history.replaceState(state2, '3', 'http://localhost/3')
  assert.equal(browser.history.length, 5, 'retains history length')
  assert.equal(popstate, 0, 'does not trigger popstate')
  assert.equal(browser.location.href, 'http://localhost/3', 'replaces location')
  assert.equal(browser.document.title, '3', 'replaces document title')
  assert.equal(browser.history.state, state2, 'replaces history state')
  browser.history.replaceState(undefined, undefined, '/4')
  assert.equal(browser.document.title, '3', 'retains document title')
  assert.equal(browser.history.state, state2, 'retains history state')
  browser.history.replaceState()
  assert.equal(browser.location.href, 'http://localhost/4', 'retains location')
  browser.history.go()
  browser.history.go(0)
  assert.equal(popstate, 2, 'reloads the page')
  assert.equal(browser.history.length, 5, 'retains history length')
  assert.equal(browser.location.href, 'http://localhost/4', 'retains location')
  assert.equal(browser.document.title, '3', 'retains document title')
  assert.equal(browser.history.state, state2, 'retains history state')
  browser.history.back()
  assert.equal(popstate, 3, 'triggers popstate event')
  assert.equal(browser.history.length, 5, 'retains history length')
  assert.equal(browser.location.href, 'http://localhost/2/4', 'rewinds location')
  assert.equal(browser.document.title, '1', 'rewinds document title')
  assert.equal(browser.history.state, state, 'rewinds history state')
  browser.history.forward()
  assert.equal(popstate, 4, 'triggers popstate event')
  assert.equal(browser.history.length, 5, 'retains history length')
  assert.equal(browser.location.href, 'http://localhost/4', 'forwards location')
  assert.equal(browser.document.title, '3', 'forwards document title')
  assert.equal(browser.history.state, state2, 'forwards history state')
  browser.history.forward()
  assert.equal(popstate, 4, 'ignores invalid forwarding')
  browser.history.go(-5)
  assert.equal(popstate, 4, 'ignores invalid rewinding')
  browser.history.go(-2)
  browser.history.pushState()
  assert.equal(browser.history.length, 4, 'trims history when going back twice and pushing another location')
}

if (require.main === module) { require('test').run(exports) }
