import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "기로기 스튜디오",
  description: "사진과 이야기로 만드는 추억 영상 — 돌잔치, 여행, 결혼, 칠순, 인생 이야기",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <header className="border-b border-line bg-paper/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
            <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
              GIROGI <span className="font-sans text-xs font-normal tracking-[0.3em] text-ink-2">STUDIO</span>
            </Link>
            <span className="text-xs text-ink-3">사진으로 만드는 이야기 영상 · 체험판</span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
