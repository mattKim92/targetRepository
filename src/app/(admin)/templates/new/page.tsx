"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "생성 실패");
      }

      router.push("/templates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // 변수 추출 미리보기
  const variables = content.match(/\{\{(\w+)\}\}/g) || [];
  const uniqueVars = [...new Set(variables)];

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">새 메시지 템플릿</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            템플릿 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 봄 시즌 프로모션"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            메시지 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="{{name}}님, 봄 시즌 할인 안내드립니다. {{product}} 최대 30% 할인!"
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {`변수는 {{변수명}} 형식으로 입력하세요. 예: {{name}}, {{product}}`}
          </p>
        </div>

        {uniqueVars.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs font-medium text-blue-700 mb-1">감지된 변수:</p>
            <div className="flex gap-1 flex-wrap">
              {uniqueVars.map((v) => (
                <span
                  key={v}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "생성 중..." : "템플릿 생성"}
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
