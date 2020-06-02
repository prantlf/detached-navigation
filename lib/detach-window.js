function detachWindowHistory (window, browser) {
  const originalLocation = window.location
  const originalHistory = window.history
  const originalDocument = window.document
  const originalAddEventListener = window.addEventListener
  const originalRemoveEventListener = window.removeEventListener
  const originalDispatchEvent = window.dispatchEvent
  delete window.location
  delete window.history
  delete window.addEventListener
  delete window.removeEventListener
  delete window.onpopstate
  delete window.onhashchange
  delete originalDocument.title
  window.location = browser.location
  window.history = browser.history
  const addEventListener = browser.addEventListener
  window.addEventListener = (eventName, handler, options) => {
    const method = eventName === 'popstate' || eventName === 'hashchange'
      ? addEventListener : originalAddEventListener
    method(eventName, handler, options)
  }
  const removeEventListener = browser.removeEventListener
  window.removeEventListener = (eventName, handler, options) => {
    const method = eventName === 'popstate' || eventName === 'hashchange'
      ? removeEventListener : originalRemoveEventListener
    method(eventName, handler, options)
  }
  const dispatchEvent = browser.dispatchEvent
  window.dispatchEvent = event => {
    const { type } = event
    const method = type === 'popstate' || type === 'hashchange'
      ? dispatchEvent : originalDispatchEvent
    return method(event)
  }
  Object.defineProperty(window, 'onpopstate', {
    configurable: true,
    get: () => browser.onpopstate,
    set: (value) => { browser.onpopstate = value }
  })
  Object.defineProperty(window, 'onhashchange', {
    configurable: true,
    get: () => browser.onhashchange,
    set: (value) => { browser.onhashchange = value }
  })
  const document = browser.document
  Object.defineProperty(originalDocument, 'title', {
    configurable: true,
    get: () => document.title,
    set: (value) => { document.title = value }
  })
  return function reattachWindowHistory () {
    window.location = originalLocation
    window.history = originalHistory
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    window.dispatchEvent = originalDispatchEvent
    delete window.onpopstate
    delete window.onhashchange
    delete originalDocument.title
  }
}

export default detachWindowHistory
