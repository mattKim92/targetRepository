"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Condition {
  field: string;
  op: string;
  value: string;
}

const FIELDS = [
  { value: "region", label: "지역" },
  { value: "grade", label: "등급" },
  { value: "gender", label: "성별" },
  { value: "age", label: "연령" },
  { value: "totalSpent", label: "총 구매금액" },
  { value: "visitCount", label: "방문횟수" },
  { value: "lastPurchaseDate", label: "최근 구매일" },
  { value: "tags", label: "태그" },
];

const OPS = [
  { value: "eq", label: "=" },
  { value: "neq", label: "!=" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "in", label: "포함" },
  { value: "contains", label: "문자열 포함" },
];

export default function NewSegmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [operator, setOperator] = useState<"AND" | "OR">("AND");
  const [conditions, setConditions] = useState<Condition[]>([
    { field: "region", op: "in", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addCondition() {
    setConditions([...conditions, { field: "region", op: "eq", value: "" }]);
  }

  function removeCondition(index: number) {
    setConditions(conditions.filter((_, i) => i !== index));
  }

  function updateCondition(index: number, updates: Partial<Condition>) {
    setConditions(
      conditions.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  }

  function parseValue(value: string, op: string): unknown {
    if (op === "in") {
      return value.split(",").map((v) => v.trim());
    }
    const num = Number(value);
    return isNaN(num) ? value : num;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const filterJson = {
      operator,
      conditions: conditions.map((c) => ({
        field: c.field,
        op: c.op,
        value: parseValue(c.value, c.op),
      })),
    };

    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, filterJson }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "생성 실패");
      }

      router.push("/segments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">새 세그먼트</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            세그먼트 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 서울 VIP 고객"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="세그먼트에 대한 설명"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            조건 연산자
          </label>
          <div className="flex gap-2">
            {(["AND", "OR"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setOperator(op)}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  operator === op
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {op === "AND" ? "모두 만족 (AND)" : "하나라도 만족 (OR)"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            필터 조건
          </label>
          {conditions.map((cond, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={cond.field}
                onChange={(e) => updateCondition(i, { field: e.target.value })}
                className="px-2 py-2 border border-gray-300 rounded-md text-sm"
              >
                {FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                value={cond.op}
                onChange={(e) => updateCondition(i, { op: e.target.value })}
                className="px-2 py-2 border border-gray-300 rounded-md text-sm"
              >
                {OPS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={cond.value}
                onChange={(e) => updateCondition(i, { value: e.target.value })}
                placeholder="값 (쉼표로 다중값)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCondition(i)}
                  className="px-2 py-2 text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCondition}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + 조건 추가
          </button>
        </div>

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
            {loading ? "생성 중..." : "세그먼트 생성"}
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
