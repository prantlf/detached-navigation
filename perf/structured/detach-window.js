import { shadowMembers, restoreShadowedMembers } from './detach-support'

function relayProperty (original, mock, propertyName) {
  Object.defineProperty(original, propertyName, {
    configurable: true,
    get: () => mock[propertyName],
    set: (value) => { mock[propertyName] = value }
  })
}

function relayEventListening (original, mock, methodName, originalMembers) {
  const originalMethod = originalMembers[methodName]
  const mockedMethod = mock[methodName]
  original[methodName] = (eventName, handler, options) => {
    const method = eventName === 'popstate' || eventName === 'hashchange' ? mockedMethod : originalMethod
    method(eventName, handler, options)
  }
}

function relayEventDispatching (original, mock, originalMembers) {
  const originalMethod = originalMembers.dispatchEvent
  const mockedMethod = mock.dispatchEvent
  original.dispatchEvent = event => {
    const { type } = event
    const method = type === 'popstate' || type === 'hashchange' ? mockedMethod : originalMethod
    return method(event)
  }
}

const shadowedMemberNames = [
  'location', 'history', 'addEventListener', 'removeEventListener', 'dispatchEvent'
]

function deleteRemainingProperties (original) {
  delete original.onpopstate
  delete original.onhashchange
  delete original.document.title
}

function detachWindowHistory (window, browser) {
  const originalMembers = shadowMembers(window, shadowedMemberNames)
  deleteRemainingProperties(window)
  window.location = browser.location
  window.history = browser.history
  relayEventListening(window, browser, 'addEventListener', originalMembers)
  relayEventListening(window, browser, 'removeEventListener', originalMembers)
  relayEventDispatching(window, browser, originalMembers)
  relayProperty(window, browser, 'onpopstate')
  relayProperty(window, browser, 'onhashchange')
  relayProperty(window.document, browser.document, 'title')
  return function reattachWindowHistory () {
    restoreShadowedMembers(window, originalMembers)
    deleteRemainingProperties(window)
  }
}

export default detachWindowHistory
