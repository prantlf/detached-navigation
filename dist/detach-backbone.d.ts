import { History } from 'backbone'
import { Browser } from './detached-browser'

export type ReattachHistory = () => void

export default function detachBackboneHistory (
  history: History, browser: Browser): ReattachHistory
