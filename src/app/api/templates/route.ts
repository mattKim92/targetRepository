import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { extractVariables, classifyMessageType } from "@/lib/template/engine";

/** 템플릿 목록 조회 */
export async function GET() {
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(templates);
}

/** 템플릿 생성 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, content } = body;

  if (!name || !content) {
    return Response.json(
      { error: "name과 content는 필수입니다." },
      { status: 400 }
    );
  }

  const variables = extractVariables(content);
  const type = classifyMessageType(content);

  const template = await prisma.messageTemplate.create({
    data: {
      name,
      content,
      type,
      variables: JSON.stringify(variables),
    },
  });

  return Response.json(template, { status: 201 });
}
