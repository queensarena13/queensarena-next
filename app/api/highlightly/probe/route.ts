import { NextResponse } from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { probeHighlightlyCoverage } from "@/lib/providers/highlightly-provider"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const report =
      await probeHighlightlyCoverage()

    return NextResponse.json({
      success: true,
      ...report,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 200 }
    )
  }
}
