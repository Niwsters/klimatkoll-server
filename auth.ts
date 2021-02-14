const auth = require('basic-auth')

const admins = new Map([
  ["admin", { password: "ptT5e2KZxUDmy5bA" }]
])

export default function(req: any, res: any, next: any) {
  const user = auth(req)
  const correctUser = user ? admins.get(user.name) : null
  if (!user || !correctUser || correctUser.password !== user.pass) {
    res.set('WWW-Authenticate', 'Basic realm="example"')
    return res.status(401).send()
  }
  return next()
}
