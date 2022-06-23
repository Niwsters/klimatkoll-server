export function originIsAllowed(origin: string) {
  if (
    origin === 'https://spela.kortspeletklimatkoll.se' || 
    origin === 'http://localhost:4200' ||
    origin === 'http://localhost:4201' ||
    origin === 'http://localhost:3000'
  ) {
    return true
  }

  return false
}
