export class Location {
  assign (url: string): void
  reload (): void
  replace (url: string): void
  toString (): string
  hash: string
  host: string
  hostname: string
  href: string
  readonly origin: string
  pathname: string
  port: string
  protocol: string
  search: string
}

export class History {
  back (): void
  forward (): void
  go (offset: number): void
  pushState (state: object, title: string, url?: string): void
  replaceState (state: object, title: string, url?: string): void
  readonly length: number
  readonly state: object
}

export class Document {
  title: string
}

export type EventListener = (event: Event) => void

declare class EventEmitter {
  addEventListener (eventName: string, listener: EventListener): void
  removeEventListener (eventName: string, listener: EventListener): void
  dispatchEvent (event: Event): boolean
}

export class Browser extends EventEmitter {
  readonly location: Location
  readonly history: History
  readonly document: Document
  onpopstate: EventListener
  onhashchange: EventListener
}

type Window = object

export default function createDetachedBrowser (
  window?: Window, state?: object, title?: string, url?: string): Browser
