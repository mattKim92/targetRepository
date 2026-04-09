import { getDashboardSummary } from "@/lib/analytics/tracker";

/** 대시보드 요약 통계 */
export async function GET() {
  const summary = await getDashboardSummary();
  return Response.json(summary);
}
