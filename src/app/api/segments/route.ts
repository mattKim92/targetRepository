import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/** 세그먼트 목록 조회 */
export async function GET() {
  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(segments);
}

/** 세그먼트 생성 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, filterJson } = body;

  if (!name || !filterJson) {
    return Response.json(
      { error: "name과 filterJson은 필수입니다." },
      { status: 400 }
    );
  }

  // filterJson 유효성 검증
  try {
    const parsed = JSON.parse(
      typeof filterJson === "string" ? filterJson : JSON.stringify(filterJson)
    );
    if (!parsed.operator || !Array.isArray(parsed.conditions)) {
      throw new Error("Invalid filter structure");
    }
  } catch {
    return Response.json(
      { error: "filterJson 형식이 올바르지 않습니다. { operator, conditions[] } 형태여야 합니다." },
      { status: 400 }
    );
  }

  const segment = await prisma.segment.create({
    data: {
      name,
      description: description || "",
      filterJson:
        typeof filterJson === "string"
          ? filterJson
          : JSON.stringify(filterJson),
    },
  });

  return Response.json(segment, { status: 201 });
}
