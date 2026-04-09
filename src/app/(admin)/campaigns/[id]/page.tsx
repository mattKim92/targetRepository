"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface CampaignDetail {
  campaignId: string;
  campaignName: string;
  status: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  successRate: number;
  sentAt: string | null;
  logs: {
    id: string;
    recipientPhone: string;
    recipientName: string;
    status: string;
    providerMsgId: string | null;
    errorMessage: string | null;
    sentAt: string | null;
  }[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const campaignId = params.id as string;

  const loadStats = useCallback(() => {
    fetch(`/api/campaigns/${campaignId}/stats`)
      .then((r) => r.json())
      .then(setData);
  }, [campaignId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function handleSend() {
    if (!confirm("캠페인을 발송하시겠습니까?")) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: "POST",
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "발송 실패");
      }

      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  if (!data) {
    return <div className="text-gray-500">로딩 중...</div>;
  }

  const canSend = data.status === "DRAFT" || data.status === "SCHEDULED";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/campaigns")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            &larr; 캠페인 목록
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{data.campaignName}</h2>
        </div>
        {canSend && (
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? "발송 중..." : "즉시 발송"}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">상태</p>
          <StatusBadge status={data.status} />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">총 발송</p>
          <p className="text-2xl font-bold">{data.totalCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">성공 / 실패</p>
          <p className="text-2xl font-bold">
            <span className="text-green-600">{data.successCount}</span>
            {" / "}
            <span className="text-red-600">{data.failCount}</span>
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">성공률</p>
          <p className="text-2xl font-bold">{data.successRate}%</p>
        </div>
      </div>

      {/* 발송 로그 */}
      {data.logs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">발송 로그</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">수신자</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">전화번호</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">상태</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">메시지 ID</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">오류</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{log.recipientName || "-"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{log.recipientPhone}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        log.status === "SENT"
                          ? "bg-green-100 text-green-700"
                          : log.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">
                    {log.providerMsgId || "-"}
                  </td>
                  <td className="px-4 py-2 text-red-600 text-xs">
                    {log.errorMessage || "-"}
                  </td>
                </tr>
              ))}
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
      className={`inline-block mt-1 px-2 py-0.5 text-sm font-medium rounded-full ${styles[status] || styles.DRAFT}`}
    >
      {labels[status] || status}
    </span>
  );
}
