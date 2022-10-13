import { NextFunction, Request, Response } from 'express'
import basicAuth from 'basic-auth'
import fs from 'fs'

export type Credentials = { name: string, password: string }

export function credentials(): Credentials {
  return JSON.parse(fs.readFileSync('./credentials.json').toString())
}

function validateCredentials(credentials: Credentials): boolean {
  if (!credentials.name ||
       credentials.name === "" ||
      !credentials.password ||
       credentials.password === "")
    return false
  return true
}

function reject(res: Response) {
  res.set('WWW-Authenticate', 'Basic realm="card-db"')
  return res.status(401).send()
}

function credentialsValid(user: any, credentials: Credentials): boolean {
  return user && user.name === credentials.name && user.pass === credentials.password
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const creds = credentials()

  if (!validateCredentials(creds))
    return reject(res)

  if (credentialsValid(basicAuth(req), creds)) {
    return next()
  }

  return reject(res)
}
