import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rewardId } = await req.json();
    if (!rewardId) return NextResponse.json({ error: "rewardId required" }, { status: 400 });

    // Stub: full implementation would check user points, deduct them, and create a Redemption record
    return NextResponse.json({
      success: true,
      message: "Redemption request submitted successfully",
    });
  } catch (err) {
    console.error("Redeem error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
