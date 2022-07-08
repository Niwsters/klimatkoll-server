import { Language } from "../card-db/languages"
import { httpGetCardDB } from "./http-get-card-db"

export async function languages(): Promise<string[]> {
  return (await httpGetCardDB<Language[]>('/json/languages')).map(l => l.iso_639_2)
}
