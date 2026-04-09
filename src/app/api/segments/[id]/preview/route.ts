import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllCustomers, filterOptedOut } from "@/lib/segment/crm-client";
import { applySegmentFilter, parseFilter } from "@/lib/segment/builder";

/** 세그먼트 대상 고객 미리보기 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const segment = await prisma.segment.findUnique({ where: { id } });
  if (!segment) {
    return Response.json({ error: "세그먼트를 찾을 수 없습니다." }, { status: 404 });
  }

  const allCustomers = await fetchAllCustomers();
  const filter = parseFilter(segment.filterJson);
  const matched = applySegmentFilter(allCustomers, filter);
  const eligible = filterOptedOut(matched);

  return Response.json({
    segmentName: segment.name,
    totalCustomers: allCustomers.length,
    matchedCount: matched.length,
    eligibleCount: eligible.length, // 수신거부 제외
    optedOutCount: matched.length - eligible.length,
    customers: eligible.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      region: c.region,
      grade: c.grade,
    })),
  });
}
