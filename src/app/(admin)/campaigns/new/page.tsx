"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{
    matchedCount?: number;
    eligibleCount?: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/segments").then((r) => r.json()),
    ]).then(([t, s]) => {
      setTemplates(t);
      setSegments(s);
    });
  }, []);

  // 세그먼트 선택 시 대상자 미리보기
  useEffect(() => {
    if (!segmentId) {
      setPreview(null);
      return;
    }
    fetch(`/api/segments/${segmentId}/preview`, { method: "POST" })
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [segmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: Record<string, string> = { name, templateId, segmentId };
      if (scheduledAt) body.scheduledAt = new Date(scheduledAt).toISOString();

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "생성 실패");
      }

      router.push("/campaigns");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const selectedTemplate = templates.find((t) => t.id === templateId);

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">새 캠페인</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            캠페인 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 4월 봄 프로모션"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            메시지 템플릿
          </label>
          {templates.length === 0 ? (
            <p className="text-sm text-gray-500">
              템플릿이 없습니다.{" "}
              <a href="/templates/new" className="text-blue-600 hover:underline">
                먼저 템플릿을 만들어주세요
              </a>
            </p>
          ) : (
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            >
              <option value="">템플릿 선택</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          )}
          {selectedTemplate && (
            <div className="mt-2 bg-gray-50 rounded p-3 text-sm text-gray-600">
              {selectedTemplate.content}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            타겟 세그먼트
          </label>
          {segments.length === 0 ? (
            <p className="text-sm text-gray-500">
              세그먼트가 없습니다.{" "}
              <a href="/segments/new" className="text-blue-600 hover:underline">
                먼저 세그먼트를 만들어주세요
              </a>
            </p>
          ) : (
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            >
              <option value="">세그먼트 선택</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.description ? ` - ${s.description}` : ""}
                </option>
              ))}
            </select>
          )}
          {preview && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
              대상자: {preview.eligibleCount}명 (매칭: {preview.matchedCount}명, 수신거부 제외)
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            예약 발송 (선택)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            비워두면 초안(DRAFT)으로 생성됩니다. 21:00~08:00 사이는 광고 문자 발송이 제한됩니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !templateId || !segmentId}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "생성 중..." : "캠페인 생성"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
