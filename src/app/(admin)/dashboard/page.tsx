import { getDashboardSummary } from "@/lib/analytics/tracker";
import Link from "next/link";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">발송 현황 대시보드</h2>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="총 캠페인" value={summary.totalCampaigns} />
        <StatCard label="총 발송" value={summary.totalSent} unit="건" />
        <StatCard label="성공" value={summary.totalSuccess} unit="건" color="green" />
        <StatCard
          label="성공률"
          value={`${summary.overallSuccessRate}%`}
          color={summary.overallSuccessRate >= 90 ? "green" : "yellow"}
        />
      </div>

      {/* 최근 캠페인 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">최근 캠페인</h3>
          <Link
            href="/campaigns/new"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + 새 캠페인
          </Link>
        </div>
        {summary.recentCampaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            아직 캠페인이 없습니다.{" "}
            <Link href="/campaigns/new" className="text-blue-600 hover:underline">
              첫 캠페인을 만들어보세요
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">캠페인명</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">상태</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">발송</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">성공</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">성공률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.recentCampaigns.map((c) => (
                <tr key={c.campaignId} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/campaigns/${c.campaignId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.campaignName}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2 text-right">{c.totalCount}</td>
                  <td className="px-4 py-2 text-right">{c.successCount}</td>
                  <td className="px-4 py-2 text-right">{c.successRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  const colorClass =
    color === "green"
      ? "text-green-600"
      : color === "yellow"
        ? "text-yellow-600"
        : "text-gray-900";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SCHEDULED: "bg-blue-100 text-blue-700",
    SENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    DRAFT: "초안",
    SCHEDULED: "예약됨",
    SENDING: "발송중",
    COMPLETED: "완료",
    FAILED: "실패",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.DRAFT}`}
    >
      {labels[status] || status}
    </span>
  );
}
