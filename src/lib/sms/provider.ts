export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BulkRecipient {
  to: string;
  message: string;
  name?: string;
}

export interface BulkSendResult {
  total: number;
  success: number;
  failed: number;
  results: SendResult[];
}

export type DeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

export interface DeliveryStatusResult {
  messageId: string;
  status: DeliveryStatus;
  timestamp?: Date;
  error?: string;
}

export interface SmsProvider {
  /** 단건 발송 */
  sendSingle(to: string, message: string): Promise<SendResult>;
  /** 대량 발송 */
  sendBulk(recipients: BulkRecipient[]): Promise<BulkSendResult>;
  /** 발송 상태 조회 */
  getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult>;
}
