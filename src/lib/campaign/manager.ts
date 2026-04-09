/**
 * 캠페인 실행 관리자
 * 세그먼트 대상자 추출 → 템플릿 치환 → SMS 발송 → 결과 기록
 */

import { prisma } from "@/lib/db";
import { getSmsProvider } from "@/lib/sms";
import type { BulkRecipient } from "@/lib/sms";
import { fetchAllCustomers, filterOptedOut } from "@/lib/segment/crm-client";
import { applySegmentFilter, parseFilter } from "@/lib/segment/builder";
import { renderTemplate } from "@/lib/template/engine";
import { applyAdFormat, checkSendingRestriction } from "@/lib/compliance";

export interface CampaignExecutionResult {
  success: boolean;
  campaignId: string;
  total: number;
  sent: number;
  failed: number;
  error?: string;
}

/**
 * 캠페인을 실행합니다.
 * 1. 야간 발송 제한 체크
 * 2. 세그먼트 필터로 대상 고객 추출
 * 3. 수신거부 고객 제외
 * 4. 템플릿 변수 치환 + 광고 문구 삽입
 * 5. SMS 발송
 * 6. 결과 DB 기록
 */
export async function executeCampaign(
  campaignId: string
): Promise<CampaignExecutionResult> {
  // 캠페인 조회
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { template: true, segment: true },
  });

  if (!campaign) {
    return { success: false, campaignId, total: 0, sent: 0, failed: 0, error: "캠페인을 찾을 수 없습니다." };
  }

  if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
    return { success: false, campaignId, total: 0, sent: 0, failed: 0, error: `현재 상태(${campaign.status})에서는 발송할 수 없습니다.` };
  }

  // 1. 야간 발송 제한 체크
  const restriction = checkSendingRestriction();
  if (restriction.restricted) {
    return { success: false, campaignId, total: 0, sent: 0, failed: 0, error: restriction.reason };
  }

  // 상태를 SENDING으로 변경
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" },
  });

  try {
    // 2. 세그먼트 필터로 대상 고객 추출
    const allCustomers = await fetchAllCustomers();
    const filter = parseFilter(campaign.segment.filterJson);
    const filtered = applySegmentFilter(allCustomers, filter);

    // 3. 수신거부 고객 제외
    const recipients = filterOptedOut(filtered);

    if (recipients.length === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "COMPLETED", totalCount: 0, successCount: 0, failCount: 0, sentAt: new Date() },
      });
      return { success: true, campaignId, total: 0, sent: 0, failed: 0 };
    }

    // 4. 템플릿 변수 치환 + 광고 문구 삽입
    const bulkRecipients: BulkRecipient[] = recipients.map((customer) => {
      const rendered = renderTemplate(campaign.template.content, {
        name: customer.name,
        phone: customer.phone,
        region: customer.region || "",
        grade: customer.grade || "",
      });
      const message = applyAdFormat(rendered);

      return {
        to: customer.phone,
        message,
        name: customer.name,
      };
    });

    // SendLog 레코드 생성
    await prisma.sendLog.createMany({
      data: bulkRecipients.map((r) => ({
        campaignId,
        recipientPhone: r.to,
        recipientName: r.name || "",
        status: "PENDING",
      })),
    });

    // 5. SMS 발송
    const provider = getSmsProvider();
    const result = await provider.sendBulk(bulkRecipients);

    // 6. 결과 DB 기록
    const logs = await prisma.sendLog.findMany({
      where: { campaignId },
      orderBy: { createdAt: "asc" },
    });

    for (let i = 0; i < logs.length; i++) {
      const sendResult = result.results[i];
      if (sendResult) {
        await prisma.sendLog.update({
          where: { id: logs[i].id },
          data: {
            status: sendResult.success ? "SENT" : "FAILED",
            providerMsgId: sendResult.messageId || null,
            errorMessage: sendResult.error || null,
            sentAt: sendResult.success ? new Date() : null,
          },
        });
      }
    }

    // 캠페인 상태 업데이트
    const finalStatus = result.failed === result.total ? "FAILED" : "COMPLETED";
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: finalStatus,
        totalCount: result.total,
        successCount: result.success,
        failCount: result.failed,
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      campaignId,
      total: result.total,
      sent: result.success,
      failed: result.failed,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "FAILED" },
    });
    return { success: false, campaignId, total: 0, sent: 0, failed: 0, error: errorMsg };
  }
}
