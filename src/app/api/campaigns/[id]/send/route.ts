import { NextRequest } from "next/server";
import { executeCampaign } from "@/lib/campaign/manager";

/** 캠페인 즉시 발송 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await executeCampaign(id);

  if (!result.success) {
    return Response.json({ error: result.error, ...result }, { status: 400 });
  }

  return Response.json(result);
}
