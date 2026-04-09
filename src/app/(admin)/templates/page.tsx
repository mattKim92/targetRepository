import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function TemplatesPage() {
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">메시지 템플릿</h2>
        <Link
          href="/templates/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + 새 템플릿
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          템플릿이 없습니다. 새 템플릿을 만들어보세요.
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      t.type === "SMS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {t.type}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded p-3">
                {t.content}
              </p>
              {t.variables !== "[]" && (
                <div className="mt-2 flex gap-1">
                  {(JSON.parse(t.variables) as string[]).map((v) => (
                    <span
                      key={v}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
