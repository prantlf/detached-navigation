function shadowMembers (original, shadowedMemberNames) {
  const storedMembers = {}
  for (const name of shadowedMemberNames) {
    storedMembers[name] = original[name]
    delete original[name]
  }
  return storedMembers
}

function restoreShadowedMembers (original, storedMembers) {
  for (const name in storedMembers) original[name] = storedMembers[name]
}

export { shadowMembers, restoreShadowedMembers }
