import { Language } from "@klimatkoll/card-db/src/languages"
import { httpGetCardDB } from "./http-get-card-db"

export async function languages(): Promise<Language[]> {
  return (await httpGetCardDB<Language[]>('/json/languages'))
}
