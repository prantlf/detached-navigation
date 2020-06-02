import { shadowMembers, restoreShadowedMembers } from './detach-support'

const shadowedMemberNames = [
  'location', 'history', 'addEventListener', 'removeEventListener'
]

function detachBackboneHistory (history, browser) {
  const originalMembers = shadowMembers(history, shadowedMemberNames)
  return function reattachBackboneHistory () {
    restoreShadowedMembers(history, originalMembers)
  }
}

export default detachBackboneHistory
