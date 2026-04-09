import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "타겟문자 서비스",
  description: "타겟 고객 세그먼트 기반 SMS 발송 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
