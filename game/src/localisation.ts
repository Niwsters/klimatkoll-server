import { httpGetCardDB } from "./http-get-card-db"

export async function localisation() {
  return httpGetCardDB('/json/localisation')
}
