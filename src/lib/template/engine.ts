/**
 * 메시지 템플릿 엔진
 * - {{variable}} 형식의 변수 치환
 * - SMS(90byte) / LMS(2000byte) 자동 분류
 * - 광고 문구 자동 삽입
 */

/** 템플릿에서 변수명 목록을 추출합니다 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
}

/** 변수를 치환하여 최종 메시지를 생성합니다 */
export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

/**
 * 한글/영문 혼합 바이트 수를 계산합니다 (EUC-KR 기준).
 * 한글: 2byte, 영문/숫자/특수문자: 1byte
 */
export function getByteLength(str: string): number {
  let bytes = 0;
  for (const char of str) {
    const code = char.charCodeAt(0);
    // 한글 범위 (가~힣) + 한글 자모
    if (
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0x3131 && code <= 0x318e)
    ) {
      bytes += 2;
    } else {
      bytes += 1;
    }
  }
  return bytes;
}

/** SMS(90byte 이하) / LMS(초과) 자동 분류 */
export function classifyMessageType(message: string): "SMS" | "LMS" {
  return getByteLength(message) <= 90 ? "SMS" : "LMS";
}

/** 미리보기: 변수를 샘플 값으로 치환하여 보여줍니다 */
export function previewTemplate(template: string): string {
  const sampleValues: Record<string, string> = {
    name: "홍길동",
    product: "봄 시즌 상품",
    price: "29,900원",
    date: "2026-04-15",
    brand: "브랜드명",
    coupon: "SPRING2026",
    link: "https://example.com",
  };

  return renderTemplate(template, sampleValues);
}
