import { cookies } from "next/headers"
import {
  getDictionary,
  localeCookieName,
  parseLocale,
} from "@/lib/i18n"

export async function getServerLocale() {
  const cookieStore = await cookies()

  return parseLocale(
    cookieStore.get(localeCookieName)?.value
  )
}

export async function getServerDictionary() {
  return getDictionary(
    await getServerLocale()
  )
}
