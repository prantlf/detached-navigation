import { Browser, Window } from './detached-browser'

export type ReattachHistory = () => void

export default function detachWindowHistory (
  window: Window, browser: Browser): ReattachHistory
