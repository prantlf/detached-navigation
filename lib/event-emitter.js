const eventListeners = {}

class EventEmitter {
  addEventListener (eventName, listener) {
    let listeners = eventListeners[eventName]
    if (!listeners) listeners = eventListeners[eventName] = []
    listeners.push(listener)
  }

  removeEventListener (eventName, listener) {
    const listeners = eventListeners[eventName]
    if (listeners) {
      const index = listeners.findIndex(handler => handler === listener)
      if (index >= 0) listeners.splice(index, 1)
    }
  }

  dispatchEvent (event) {
    const listeners = eventListeners[event.type]
    if (listeners) for (const listener of listeners) listener(event)
    return !(event.cancelable && event.defaultPrevented)
  }
}

export default EventEmitter
