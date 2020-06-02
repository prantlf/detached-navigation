import createDetachedBrowser from '../lib/detached-browser'
import detachBackboneHistoryInlined from './inlined/detach-backbone'
import detachBackboneHistoryStructured from './structured/detach-backbone'
import { Suite } from 'benchmark'

const browser = createDetachedBrowser()
const history = {}

const suite = new Suite()
console.log('detach-window:')
suite
  .add('inlined', () => detachBackboneHistoryInlined(history, browser)())
  .add('structured', () => detachBackboneHistoryStructured(history, browser)())
  .on('cycle', ({ target }) => console.log(`  ${String(target)}`))
  .on('complete', () => console.log(`  fastest is ${suite.filter('fastest').map('name')}`))
  .run()
