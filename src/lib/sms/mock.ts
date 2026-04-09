import type {
  SmsProvider,
  SendResult,
  BulkRecipient,
  BulkSendResult,
  DeliveryStatusResult,
} from "./provider";

/**
 * 테스트용 Mock SMS Provider.
 * 실제 발송 없이 성공/실패를 시뮬레이션합니다.
 * failRate로 실패 확률을 조절할 수 있습니다 (0~1).
 */
export class MockSmsProvider implements SmsProvider {
  private logs: Map<string, { to: string; message: string; sentAt: Date }> =
    new Map();
  private failRate: number;

  constructor(failRate = 0) {
    this.failRate = failRate;
  }

  async sendSingle(to: string, message: string): Promise<SendResult> {
    const shouldFail = Math.random() < this.failRate;

    if (shouldFail) {
      return { success: false, error: "Mock: simulated failure" };
    }

    const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.logs.set(messageId, { to, message, sentAt: new Date() });

    console.log(`[MockSMS] Sent to ${to}: ${message.slice(0, 50)}...`);
    return { success: true, messageId };
  }

  async sendBulk(recipients: BulkRecipient[]): Promise<BulkSendResult> {
    const results: SendResult[] = [];
    for (const r of recipients) {
      const result = await this.sendSingle(r.to, r.message);
      results.push(result);
    }

    const success = results.filter((r) => r.success).length;
    return {
      total: recipients.length,
      success,
      failed: recipients.length - success,
      results,
    };
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult> {
    const log = this.logs.get(messageId);
    if (!log) {
      return { messageId, status: "FAILED", error: "Message not found" };
    }
    return { messageId, status: "DELIVERED", timestamp: log.sentAt };
  }

  /** 테스트용: 전체 발송 로그 조회 */
  getLogs() {
    return Array.from(this.logs.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }
}
