import ProfileButton from '@/components/header/ProfileButton';
import ThemeButton from '@/components/header/ThemeButton';
import ModalProvider from '@/components/providers/ModalProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// 이미지 가져오기
const logo = '/assets/logo.png';
//SEO
const siteUrl = 'https://sns.devgr.kr';
const defaultOgImage = `${siteUrl}/assets/logo.png`;
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  url: siteUrl,
  name: 'SNS 서비스',
  logo: `${siteUrl}${logo}`,
  sameAs: ['https://x.com/devgreact'],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SNS 서비스',
    template: '%s | SNS 서비스',
  },
  description: 'Next.js와 Supabase로 구현된 실시간 SNS 커뮤니티.',
  keywords: ['SNS', '소셜 피드', 'Next.js', 'Supabase', '커뮤니티'],
  alternates: {
    canonical: '/',
    languages: {
      ko: '/ko',
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'SNS 서비스',
    title: 'SNS 서비스',
    description: '친구들과 게시글을 공유하고 소통하는 SNS.',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'SNS 서비스 미리보기 이미지',
      },
    ],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@devgreact',
    creator: '@devgreact',
    title: 'SNS 서비스',
    description: '실시간 소셜 업데이트를 공유하는 SNS 서비스.',
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' suppressHydrationWarning>
      {/* 추가 */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
                try {
                  const stored = localStorage.getItem('ThemeStore');
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    const themeValue = parsed?.state?.theme || parsed?.theme || 'light';
                    const htmlTag = document.documentElement;
                    htmlTag.classList.remove('dark', 'light');
                    
                    if (themeValue === 'system') {
                      const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      htmlTag.classList.add(isDarkTheme ? 'dark' : 'light');
                    } else {
                      htmlTag.classList.add(themeValue);
                    }
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })()`,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Portal 용 DIV */}
        <div id='modal-root' />

        <div className='flex min-h-[100vh] flex-col'>
          {/* 컴포넌트 배치 */}
          <ToastProvider />

          <QueryProvider>
            <SessionProvider>
              <ModalProvider>
                <header className='h-15 border-b'>
                  <div className='m-auto flex h-full w-full max-w-175 justify-between px-4'>
                    <Link href={'/'} className='flex items-center gap-2'>
                      <Image
                        src={logo}
                        alt='SNS 서비스 로고'
                        width={40}
                        height={40}
                      />
                      <div className='font-bold'>SNS 서비스</div>
                    </Link>

                    <div className='flex items-center gap-5'>
                      {/* 테마 적용 버튼 */}
                      <ThemeButton />
                      <ProfileButton />
                    </div>
                  </div>
                </header>
                <main className='m-auto w-full max-w-175 flex-1 border-x px-4 py-6'>
                  {children}
                </main>
                <footer className='text-muted-foreground border-t py-10 text-center'>
                  @devgeact
                </footer>
              </ModalProvider>
            </SessionProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
