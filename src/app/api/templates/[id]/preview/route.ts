import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { renderTemplate, classifyMessageType, getByteLength } from "@/lib/template/engine";
import { applyAdFormat } from "@/lib/compliance";

/** 템플릿 변수 치환 미리보기 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const variables: Record<string, string> = body.variables || {};

  const template = await prisma.messageTemplate.findUnique({ where: { id } });
  if (!template) {
    return Response.json({ error: "템플릿을 찾을 수 없습니다." }, { status: 404 });
  }

  const rendered = renderTemplate(template.content, variables);
  const withAd = applyAdFormat(rendered);
  const type = classifyMessageType(withAd);
  const byteLength = getByteLength(withAd);

  return Response.json({
    original: template.content,
    rendered,
    withAdFormat: withAd,
    type,
    byteLength,
  });
}
