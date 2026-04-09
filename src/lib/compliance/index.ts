/**
 * 정보통신망법 준수 모듈
 * - 광고 문구 자동 삽입
 * - 야간 발송 차단 (21:00 ~ 08:00)
 * - 수신거부 문구 삽입
 */

const OPT_OUT_NUMBER = process.env.OPT_OUT_NUMBER || "080-XXX-XXXX";
const SENDER_NAME = process.env.SENDER_NAME || "발신자명";

/** 광고 메시지에 법적 필수 문구를 삽입합니다 */
export function applyAdFormat(message: string): string {
  const adPrefix = "(광고)";
  const optOutSuffix = `\n[무료수신거부] ${OPT_OUT_NUMBER}`;

  // 이미 광고 표기가 있으면 건너뜀
  const hasAdPrefix = message.startsWith("(광고)");
  const hasOptOut = message.includes("[무료수신거부]");

  let result = message;
  if (!hasAdPrefix) {
    result = `${adPrefix} ${SENDER_NAME}\n${result}`;
  }
  if (!hasOptOut) {
    result = `${result}${optOutSuffix}`;
  }
  return result;
}

/**
 * 현재 시각이 야간 발송 금지 시간대인지 확인합니다.
 * 21:00 ~ 08:00 (KST) 사이에는 광고 문자 발송이 금지됩니다.
 */
export function isNightTimeRestricted(date?: Date): boolean {
  const now = date || new Date();
  // KST = UTC + 9
  const kstHour = (now.getUTCHours() + 9) % 24;
  return kstHour >= 21 || kstHour < 8;
}

/** 야간 발송 제한 여부와 메시지를 반환합니다 */
export function checkSendingRestriction(): {
  restricted: boolean;
  reason?: string;
} {
  if (isNightTimeRestricted()) {
    return {
      restricted: true,
      reason:
        "야간 발송 제한 시간입니다 (21:00~08:00). 광고성 문자는 이 시간에 발송할 수 없습니다.",
    };
  }
  return { restricted: false };
}

/** 예약 발송 시각이 야간 제한에 걸리는지 검증합니다 */
export function validateScheduledTime(scheduledAt: Date): {
  valid: boolean;
  reason?: string;
} {
  if (isNightTimeRestricted(scheduledAt)) {
    return {
      valid: false,
      reason:
        "예약 시간이 야간 발송 제한 시간대(21:00~08:00)에 해당합니다. 08:00 이후로 설정해주세요.",
    };
  }
  return { valid: true };
}
