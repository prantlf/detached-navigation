import createDetachedBrowser from '../lib/detached-browser'
import detachWindowHistoryInlined from './inlined/detach-window'
import detachWindowHistoryStructured from './structured/detach-window'
import { Suite } from 'benchmark'

const browser = createDetachedBrowser()
const window = { document: {} }

const suite = new Suite()
console.log('detach-window:')
suite
  .add('inlined', () => detachWindowHistoryInlined(window, browser)())
  .add('structured', () => detachWindowHistoryStructured(window, browser)())
  .on('cycle', ({ target }) => console.log(`  ${String(target)}`))
  .on('complete', () => console.log(`  fastest is ${suite.filter('fastest').map('name')}`))
  .run()
