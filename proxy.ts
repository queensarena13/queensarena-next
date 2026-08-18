import { NextRequest, NextResponse } from "next/server"

function isAdminRequest(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  )
}

function isInternalApiRequest(pathname: string) {
  return (
    pathname === "/api/setup/status" ||
    pathname === "/api/cleanup" ||
    pathname.startsWith("/api/import/") ||
    pathname.startsWith("/api/sportmonks/") ||
    pathname.startsWith("/api/highlightly/") ||
    pathname === "/api/data-quality"
  )
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="QueensArena Admin", charset="UTF-8"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })
}

function notConfigured() {
  return new NextResponse("Admin access not configured", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    !isAdminRequest(pathname) &&
    !isInternalApiRequest(pathname)
  ) {
    return NextResponse.next()
  }

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    return notConfigured()
  }

  const authorization =
    request.headers.get("authorization")

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized()
  }

  const encoded = authorization.slice("Basic ".length)
  const decoded = atob(encoded)
  const separator = decoded.indexOf(":")
  const receivedUsername = decoded.slice(0, separator)
  const receivedPassword = decoded.slice(separator + 1)

  if (
    receivedUsername !== username ||
    receivedPassword !== password
  ) {
    return unauthorized()
  }

  const response = NextResponse.next()
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  response.headers.set("Cache-Control", "no-store")
  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/api/setup/status",
    "/api/cleanup",
    "/api/import/:path*",
    "/api/sportmonks/:path*",
    "/api/highlightly/:path*",
    "/api/data-quality",
  ],
}
