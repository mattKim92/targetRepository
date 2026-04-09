import type { SmsProvider } from "./provider";
import { MockSmsProvider } from "./mock";
import { CoolSmsProvider } from "./coolsms";

export type { SmsProvider, SendResult, BulkRecipient, BulkSendResult, DeliveryStatusResult } from "./provider";

let providerInstance: SmsProvider | null = null;

/**
 * SMS Provider 싱글턴 인스턴스를 반환합니다.
 * SMS_PROVIDER 환경 변수에 따라 어댑터를 선택합니다.
 *   - "coolsms": CoolSMS 어댑터
 *   - "mock" (기본): Mock 어댑터
 */
export function getSmsProvider(): SmsProvider {
  if (providerInstance) return providerInstance;

  const providerType = process.env.SMS_PROVIDER || "mock";

  switch (providerType) {
    case "coolsms":
      providerInstance = new CoolSmsProvider();
      break;
    case "mock":
    default:
      providerInstance = new MockSmsProvider(0.05); // 5% 실패율
      break;
  }

  return providerInstance;
}
