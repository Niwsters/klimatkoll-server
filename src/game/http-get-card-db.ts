import http from 'http'

function parseJSON(jsonStr: string): any {
  try {
    const json = JSON.parse(jsonStr)
    return json
  } catch(e) {
    console.log(`WARNING: httpGetCardDB failed to parse JSON string ${jsonStr}`)
    return ""
  }
}

export async function httpGetCardDB<T>(path: string): Promise<T> {
  return new Promise(resolve => {
    http.request(
      {
        host: 'localhost',
        port: '3001',
        path
      },
      response => {
        let str = ''
        response.on('data', data => str += data)
        response.on('end', () => resolve(parseJSON(str)))
      })
      .end()
  })
}
