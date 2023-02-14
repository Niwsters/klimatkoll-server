function isDevMode(rootElement: HTMLElement): boolean {
  const devModeAttr = rootElement.getAttribute('devmode')
  return devModeAttr !== undefined &&
         devModeAttr !== null ? true : false
}

function getLanguage(rootElement: HTMLElement): string {
  return rootElement.getAttribute('lang') || 'sv'
}

function getServerUrl(rootElement: HTMLElement): string {
  return getHttpServerURL(isDevMode(rootElement))
}

function getHost(devMode: boolean) {
  if (devMode === true)
    return "localhost:4200"

  return "spela.kortspeletklimatkoll.se"
}

function getHttpServerURL(devMode: boolean) {
  const scheme = devMode === true ? 'http' : 'https'

  return `${scheme}://${getHost(devMode)}`
}

function getWSServerURL(devMode: boolean) {
  const scheme = devMode === true ? 'ws' : 'wss'

  return `${scheme}://${getHost(devMode)}`
}

export type Environment = {
  readonly language: string
  readonly devMode: boolean
  readonly httpServerURL: string
  readonly wsServerURL: string
}

export function getEnvironment(rootElement: HTMLElement): Environment {
  return {
    language: getLanguage(rootElement),
    devMode: isDevMode(rootElement),
    httpServerURL: getServerUrl(rootElement),
    wsServerURL: getWSServerURL(isDevMode(rootElement))
  } as const
}
