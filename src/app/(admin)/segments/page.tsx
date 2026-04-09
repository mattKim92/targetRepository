import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function SegmentsPage() {
  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">세그먼트</h2>
        <Link
          href="/segments/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + 새 세그먼트
        </Link>
      </div>

      {segments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          세그먼트가 없습니다. 타겟 고객 그룹을 만들어보세요.
        </div>
      ) : (
        <div className="grid gap-4">
          {segments.map((s) => {
            const filter = JSON.parse(s.filterJson);
            return (
              <div
                key={s.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    {s.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    캠페인 {s._count.campaigns}개
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    조건 ({filter.operator})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {filter.conditions?.map(
                      (
                        c: { field: string; op: string; value: unknown },
                        i: number
                      ) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {c.field} {c.op} {JSON.stringify(c.value)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
