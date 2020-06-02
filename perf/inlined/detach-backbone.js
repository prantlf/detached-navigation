function detachBackboneHistory (history, browser) {
  const originalLocation = history.location
  const originalHistory = history.history
  const originalAddEventListener = history.addEventListener
  const originalRemoveEventListener = history.removeEventListener
  history.location = browser.location
  history.history = browser.history
  history.addEventListener = browser.addEventListener
  history.removeEventListener = browser.removeEventListener
  return function reattachBackboneHistory () {
    history.location = originalLocation
    history.history = originalHistory
    history.addEventListener = originalAddEventListener
    history.removeEventListener = originalRemoveEventListener
  }
}

export default detachBackboneHistory
