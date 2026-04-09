import { NextRequest } from "next/server";
import { getCampaignStats, getCampaignSendLogs } from "@/lib/analytics/tracker";

/** 캠페인 발송 결과 통계 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stats = await getCampaignStats(id);
  if (!stats) {
    return Response.json({ error: "캠페인을 찾을 수 없습니다." }, { status: 404 });
  }

  const logs = await getCampaignSendLogs(id);

  return Response.json({
    ...stats,
    logs,
  });
}
