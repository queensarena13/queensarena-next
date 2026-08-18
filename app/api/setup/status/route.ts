import { NextResponse } from "next/server"
import { getSetupStatus } from "@/lib/setup-status"
import { getErrorMessage } from "@/lib/errors"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const status = await getSetupStatus()

    return NextResponse.json({
      success: true,
      ...status,
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
