import EventEmitter from './event-emitter'

function createDetachedBrowser (parent, state, title, url) {
  if (parent == null) parent = typeof window !== 'undefined' ? window : {}
  if (state === undefined) {
    if (parent.history !== undefined) state = parent.history.state
    if (state === undefined) state = null
  }
  if (title === undefined) {
    if (parent.document !== undefined) title = parent.document.title
    if (title === undefined) title = 'Untitled'
  }
  if (url === undefined) {
    if (parent.location !== undefined) url = parent.location.href
    if (url === undefined) url = 'detached://default'
  }

  const { PopStateEvent, HashChangeEvent } = parent
  const currentURL = new URL(url)

  function announceLocationChange (oldURL, oldHash, state = null) {
    browser.dispatchEvent(new PopStateEvent('popstate'), { state })
    if (oldHash !== currentURL.hash) {
      browser.dispatchEvent(new HashChangeEvent('hashchange', {
        oldURL, newURL: currentURL.href
      }))
    }
  }

  function updateLocation () {
    pushURL()
    browser.dispatchEvent(new PopStateEvent('popstate'))
  }

  class Location {
    assign (url) {
      const { href, hash } = currentURL
      pushURL(url)
      announceLocationChange(href, hash)
    }

    reload () {
      browser.dispatchEvent(new PopStateEvent('popstate'), { state: history.state })
    }

    replace (url) {
      const { href, hash } = currentURL
      replaceURL(url)
      announceLocationChange(href, hash)
    }

    toString () { return currentURL.toString() }
    get hash () { return currentURL.hash }
    set hash (value) {
      if (!value.startsWith('#')) value = `#${value}`
      const { href, hash } = currentURL
      currentURL.hash = value
      pushURL()
      announceLocationChange(href, hash)
    }

    get host () { return currentURL.host }
    set host (value) {
      currentURL.host = value
      updateLocation()
    }

    get hostname () { return currentURL.hostname }
    set hostname (value) {
      currentURL.hostname = value
      updateLocation()
    }

    get href () { return currentURL.href }
    set href (value) {
      const { href, hash } = currentURL
      currentURL.href = value
      pushURL()
      announceLocationChange(href, hash)
    }

    get origin () { return currentURL.origin }

    get pathname () { return currentURL.pathname }
    set pathname (value) {
      currentURL.pathname = value
      updateLocation()
    }

    get port () { return currentURL.port }
    set port (value) {
      currentURL.port = value
      updateLocation()
    }

    get protocol () { return currentURL.protocol }
    set protocol (value) {
      if (!value.endsWith(':')) value = `${value}:`
      currentURL.protocol = value
      updateLocation()
    }

    get search () { return currentURL.search }
    set search (value) {
      if (!value.startsWith('?')) value = `?${value}`
      currentURL.search = value
      updateLocation()
    }
  }

  const historyEntries = [{ state, title, url }]
  let currentIndex = 0

  function setCurrentURL (url) {
    if (url !== undefined) {
      const origin = currentURL.origin
      if (url.startsWith(origin)) {
        currentURL.href = url
        return url
      }
      const { href } = new URL(url, currentURL.href)
      if (!href.startsWith(origin)) {
        throw new Error(`A history state object with URL '${url}' cannot be created in a document with origin '${origin}' and URL '${currentURL.href}'.`)
      }
      currentURL.href = href
      return href
    }
  }

  function pushURL (url) {
    if (url !== undefined) currentURL.href = url
    pushState(null, undefined, url)
  }

  function pushState (state, title, url) {
    if (url === undefined) url = currentURL.href
    if (title === undefined) title = document.title
    if (state === undefined) state = history.state
    historyEntries[++currentIndex] = { state, title, url }
    historyEntries.length = currentIndex + 1
  }

  function replaceURL (url) {
    currentURL.href = url
    replaceState(null, undefined, url)
  }

  function replaceState (state, title, url) {
    if (url === undefined) url = currentURL.href
    if (title === undefined) title = document.title
    if (state === undefined) state = history.state
    historyEntries[currentIndex] = { state, title, url }
  }

  class History {
    back () {
      this.go(-1)
    }

    forward () {
      this.go(1)
    }

    go (offset) {
      if (!offset) {
        location.reload()
      } else {
        const newIndex = currentIndex + offset
        if (newIndex > 0 && newIndex < historyEntries.length) {
          const { href, hash } = currentURL
          currentIndex = newIndex
          const { state, url } = historyEntries[currentIndex]
          currentURL.href = url
          announceLocationChange(href, hash, state)
        }
      }
    }

    pushState (state, title, url) {
      url = setCurrentURL(url)
      pushState(state, title, url)
    }

    replaceState (state, title, url) {
      url = setCurrentURL(url)
      replaceState(state, title, url)
    }

    get length () { return historyEntries.length }
    get state () { return historyEntries[currentIndex].state }
  }

  class Document {
    get title () { return historyEntries[currentIndex].title }
    set title (value) { historyEntries[currentIndex].title = value }
  }

  let onpopstate, onhashchange

  class Browser extends EventEmitter {
    get document () { return document }
    get location () { return location }
    set location (value) { location.assign(value) }
    get history () { return history }
    get onpopstate () { return onpopstate }
    set onpopstate (value) {
      if (onpopstate) this.removeEventListener('popstate', onpopstate)
      onpopstate = value
      if (value) this.addEventListener('popstate', value)
    }

    get onhashchange () { return onhashchange }
    set onhashchange (value) {
      if (onhashchange) this.removeEventListener('hashchange', onhashchange)
      onhashchange = value
      if (value) this.addEventListener('hashchange', value)
    }
  }

  const location = new Location()
  const history = new History()
  const document = new Document()
  const browser = new Browser()

  return browser
}

export default createDetachedBrowser
