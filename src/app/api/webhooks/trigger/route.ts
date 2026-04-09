import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSmsProvider } from "@/lib/sms";
import { renderTemplate } from "@/lib/template/engine";
import { applyAdFormat, checkSendingRestriction } from "@/lib/compliance";

/**
 * 트리거 기반 자동 발송 Webhook
 * 외부 시스템(주문 완료, 배송 시작 등)에서 이벤트를 수신하여 문자를 발송합니다.
 *
 * 요청 예시:
 * POST /api/webhooks/trigger
 * {
 *   "event": "order_completed",
 *   "templateId": "clxxx...",
 *   "recipient": { "phone": "01012345678", "name": "홍길동" },
 *   "variables": { "product": "스프링 자켓", "orderNo": "ORD-2026-001" }
 * }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event, templateId, recipient, variables } = body;

  if (!event || !templateId || !recipient?.phone) {
    return Response.json(
      { error: "event, templateId, recipient.phone은 필수입니다." },
      { status: 400 }
    );
  }

  // 야간 발송 제한 체크
  const restriction = checkSendingRestriction();
  if (restriction.restricted) {
    return Response.json({ error: restriction.reason }, { status: 403 });
  }

  // 템플릿 조회
  const template = await prisma.messageTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) {
    return Response.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  }

  // 메시지 생성
  const rendered = renderTemplate(template.content, {
    name: recipient.name || "",
    phone: recipient.phone,
    ...variables,
  });
  const message = applyAdFormat(rendered);

  // 발송
  const provider = getSmsProvider();
  const result = await provider.sendSingle(recipient.phone, message);

  return Response.json({
    event,
    recipient: recipient.phone,
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  });
}
