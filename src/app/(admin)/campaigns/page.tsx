import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: { template: true, segment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">캠페인</h2>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + 새 캠페인
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          캠페인이 없습니다.{" "}
          <Link href="/campaigns/new" className="text-blue-600 hover:underline">
            첫 캠페인을 만들어보세요
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">캠페인명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">템플릿</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">세그먼트</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">발송</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">성공률</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">생성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => {
                const rate = c.totalCount > 0
                  ? Math.round((c.successCount / c.totalCount) * 100)
                  : 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.template.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.segment.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.totalCount > 0 ? `${c.successCount}/${c.totalCount}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.totalCount > 0 ? `${rate}%` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
