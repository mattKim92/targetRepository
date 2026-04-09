import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { validateScheduledTime } from "@/lib/compliance";

/** 캠페인 목록 조회 */
export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: { template: true, segment: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(campaigns);
}

/** 캠페인 생성 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, templateId, segmentId, scheduledAt } = body;

  if (!name || !templateId || !segmentId) {
    return Response.json(
      { error: "name, templateId, segmentId는 필수입니다." },
      { status: 400 }
    );
  }

  // 템플릿/세그먼트 존재 확인
  const [template, segment] = await Promise.all([
    prisma.messageTemplate.findUnique({ where: { id: templateId } }),
    prisma.segment.findUnique({ where: { id: segmentId } }),
  ]);

  if (!template) {
    return Response.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  }
  if (!segment) {
    return Response.json({ error: "세그먼트를 찾을 수 없습니다." }, { status: 404 });
  }

  // 예약 발송 시 야간 제한 검증
  let status = "DRAFT";
  let parsedScheduledAt: Date | null = null;

  if (scheduledAt) {
    parsedScheduledAt = new Date(scheduledAt);
    const validation = validateScheduledTime(parsedScheduledAt);
    if (!validation.valid) {
      return Response.json({ error: validation.reason }, { status: 400 });
    }
    status = "SCHEDULED";
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      templateId,
      segmentId,
      status,
      scheduledAt: parsedScheduledAt,
    },
    include: { template: true, segment: true },
  });

  return Response.json(campaign, { status: 201 });
}
