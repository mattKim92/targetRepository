/**
 * 발송 결과 분석 & 통계
 */

import { prisma } from "@/lib/db";

export interface CampaignStats {
  campaignId: string;
  campaignName: string;
  status: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  successRate: number;
  sentAt: Date | null;
}

export interface DashboardSummary {
  totalCampaigns: number;
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  overallSuccessRate: number;
  recentCampaigns: CampaignStats[];
}

/** 캠페인별 발송 통계를 조회합니다 */
export async function getCampaignStats(
  campaignId: string
): Promise<CampaignStats | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) return null;

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: campaign.status,
    totalCount: campaign.totalCount,
    successCount: campaign.successCount,
    failCount: campaign.failCount,
    successRate:
      campaign.totalCount > 0
        ? Math.round((campaign.successCount / campaign.totalCount) * 100)
        : 0,
    sentAt: campaign.sentAt,
  };
}

/** 캠페인의 건별 발송 로그를 조회합니다 */
export async function getCampaignSendLogs(campaignId: string) {
  return prisma.sendLog.findMany({
    where: { campaignId },
    orderBy: { createdAt: "desc" },
  });
}

/** 대시보드 요약 정보를 조회합니다 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.totalCount, 0);
  const totalSuccess = campaigns.reduce((sum, c) => sum + c.successCount, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.failCount, 0);
  const overallSuccessRate =
    totalSent > 0 ? Math.round((totalSuccess / totalSent) * 100) : 0;

  const recentCampaigns: CampaignStats[] = campaigns.slice(0, 10).map((c) => ({
    campaignId: c.id,
    campaignName: c.name,
    status: c.status,
    totalCount: c.totalCount,
    successCount: c.successCount,
    failCount: c.failCount,
    successRate:
      c.totalCount > 0
        ? Math.round((c.successCount / c.totalCount) * 100)
        : 0,
    sentAt: c.sentAt,
  }));

  return {
    totalCampaigns,
    totalSent,
    totalSuccess,
    totalFailed,
    overallSuccessRate,
    recentCampaigns,
  };
}
