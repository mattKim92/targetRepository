import type {
  SmsProvider,
  SendResult,
  BulkRecipient,
  BulkSendResult,
  DeliveryStatusResult,
} from "./provider";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CoolSMS 어댑터.
 * coolsms-node-sdk 설치 후 사용: npm install coolsms-node-sdk
 *
 * 환경 변수:
 *   COOLSMS_API_KEY - CoolSMS API Key
 *   COOLSMS_API_SECRET - CoolSMS API Secret
 *   COOLSMS_SENDER - 등록된 발신번호
 */
export class CoolSmsProvider implements SmsProvider {
  private apiKey: string;
  private apiSecret: string;
  private sender: string;

  constructor() {
    this.apiKey = process.env.COOLSMS_API_KEY || "";
    this.apiSecret = process.env.COOLSMS_API_SECRET || "";
    this.sender = process.env.COOLSMS_SENDER || "";

    if (!this.apiKey || !this.apiSecret || !this.sender) {
      console.warn(
        "[CoolSMS] Missing environment variables. Set COOLSMS_API_KEY, COOLSMS_API_SECRET, COOLSMS_SENDER."
      );
    }
  }

  private async getSDK(): Promise<any> {
    // 런타임에서만 로드 (빌드 타임 resolve 회피를 위해 변수로 모듈명 전달)
    const moduleName = "coolsms-node-sdk";
    try {
      return await import(/* webpackIgnore: true */ moduleName);
    } catch {
      throw new Error(
        "coolsms-node-sdk가 설치되지 않았습니다. npm install coolsms-node-sdk 를 실행해주세요."
      );
    }
  }

  async sendSingle(to: string, message: string): Promise<SendResult> {
    try {
      const CoolSMS = await this.getSDK();
      const messageService = new CoolSMS.default(this.apiKey, this.apiSecret);

      const response = await messageService.sendOne({
        to,
        from: this.sender,
        text: message,
        autoTypeDetect: true,
      });

      return { success: true, messageId: response.messageId };
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errMsg };
    }
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
    try {
      const CoolSMS = await this.getSDK();
      const messageService = new CoolSMS.default(this.apiKey, this.apiSecret);

      const response = await messageService.getMessages({ messageId });
      const msg = response.messageList?.[messageId];

      if (!msg) {
        return { messageId, status: "PENDING" };
      }

      const statusMap: Record<string, DeliveryStatusResult["status"]> = {
        SENDING: "PENDING",
        COMPLETE: "DELIVERED",
        FAILED: "FAILED",
      };

      return {
        messageId,
        status: statusMap[msg.statusCode] || "PENDING",
      };
    } catch {
      return { messageId, status: "PENDING" };
    }
  }
}
