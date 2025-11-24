# 최적화 작업

## 1. SSR 과 CSR 검토

- `use client` 적용됨
- 페이지 및 하위 컴포넌트들은 모두 `CSR` 이 되어버림.
- 사용자 입력폼은 별도로 컴포넌트로 추출해서 배치하길 권장

## 2. SEO 적용

### 2.1. Root Layout MetaData 및 OG(Open Graph) 확장 적용

- `/src/app/layout.tsx`
- 전역 메타데이터, Open Graph, Twitter 카드, 캐노니컬 URL, 조직 스키마까지 기본 값을 세팅해 전체 페이지의 검색·공유 품질을 끌어올립니다.
- metadataBase 를 선언해 절대 URL 생성 기준을 고정합니다.
- title 을 default/template 형태로 정의해 각 페이지가 일관된 네이밍 규칙을 따르도록 합니다.
- openGraph, twitter, alternates 를 채워 공유 썸네일과 다국어 URL 구조를 설정합니다.
- JSON-LD 스키마는 <script type="application/ld+json"> 로 주입하고, Organization 엔터티를 선언합니다.

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://sns.devgr.kr'),
  title: {
    default: 'SNS 서비스',
    template: '%s | SNS 서비스',
  },
  description: '실시간 소셜 업데이트를 공유하는 SNS 서비스',
  keywords: ['SNS', '소셜 피드', 'Supabase', 'Next.js'],
  alternates: {
    canonical: '/',
    languages: {
      ko: '/ko',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://sns.devgr.kr',
    title: 'SNS 서비스',
    description: '친구들과 게시글을 공유하는 SNS',
    siteName: 'SNS 서비스',
    images: [
      {
        url: 'https://sns.devgr.kr/og-cover.png',
        width: 1200,
        height: 630,
        alt: 'SNS 서비스 미리보기',
      },
    ],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@devgreact',
    title: 'SNS 서비스',
    description: 'Next.js + Supabase SNS',
    images: ['https://sns.devgr.kr/og-cover.png'],
  },
};

<script
  type='application/ld+json'
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      url: 'https://sns.devgr.kr',
      name: 'SNS 서비스',
      logo: 'https://sns.devgr.kr/assets/logo.png',
      sameAs: ['https://x.com/devgreact'],
    }),
  }}
/>;
```

- 실제 적용 코드

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import Link from 'next/link';
import Image from 'next/image';
import { Sun } from 'lucide-react';
import ToastProvider from '@/components/providers/ToastProvider';
import SessionProvider from '@/components/providers/SessionProvider';
import ModalProvider from '@/components/providers/ModalProvider';
import ProfileButton from '@/components/header/ProfileButton';
import ThemeButton from '@/components/header/ThemeButton';

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

// SEO
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
```

### 2.2. 인증 관련페이지 메타데이터

- 각 페이지에서 유입 키워드가 명확해지도록 개별 메타데이터를 선언.
- 서버 컴포넌트에서 export const metadata 를 선언.
- `robots 옵션`으로 검색 허용 여부를 제어. (예: 로그인 페이지는 인덱싱 허용, 비밀번호 재설정 페이지는 차단)
- `description 에 자연어 문장`으로 작성

### 2.3. `src/app/(default)/signin/page.tsx`

```tsx
export const metadata: Metadata = {
  title: '로그인',
  description: 'SNS 서비스에 로그인하고 실시간 피드를 확인하세요.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/signin' },
};
```

```tsx
import SignInContent from '@/components/signin/SignInConent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: 'SNS 서비스에 로그인하고 실시간 피드를 확인하세요.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/signin' },
};

function SignIn() {
  return <SignInContent />;
}

export default SignIn;
```

- `/src/components/signin 폴더` 생성
- `/src/components/signin/SignInConent.tsx 파일` 생성

```tsx
'use client';
import { useSignInWithGoogle } from '@/hooks/mutations/auth/useSignInWithGoogle';
import { useSignInWithKakao } from '@/hooks/mutations/auth/useSignInWithKakao';
import { useSignInWithPassword } from '@/hooks/mutations/auth/useSignInWithPassword';
import { getErrorMessage } from '@/lib/error';
import { useSession } from '@/stores/session';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignInContent() {
  const router = useRouter();
  const session = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  // 이메일로 로그인
  const { mutate: signInPassword, isPending: isPendingPassword } =
    useSignInWithPassword({
      onError: error => {
        setPassword('');
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });

  const handleSignInWithEmail = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // 이메일을 이용해서 로그인 진행
    signInPassword({ email: email, password: password });
  };

  // 카카오 로그인
  const { mutate: signInWithKakao, isPending: isPendingKakao } =
    useSignInWithKakao({
      onError: error => {
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });

  const handleSignInWithKakao = () => {
    signInWithKakao('kakao');
  };

  // 구글 로그인
  const { mutate: signInWithGoogle, isPending: isPendingGoogle } =
    useSignInWithGoogle({
      onError: error => {
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });

  const handleSignInWithGoogle = () => {
    signInWithKakao('google');
  };

  if (session) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-lg'>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>로그인</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isPendingPassword}
          type='email'
          className='py-6'
          placeholder='example@example.com'
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isPendingPassword}
          type='password'
          className='py-6'
          placeholder='password'
        />
      </div>
      <div className='flex flex-col gap-2'>
        {/* 비밀번호 및 이메일 로그인 */}
        <Button
          onClick={handleSignInWithEmail}
          className='w-full cursor-pointer'
          disabled={isPendingPassword}
        >
          로그인
        </Button>
        {/* 카카오 소셜 로그인 */}
        <Button
          className='w-full cursor-pointer'
          onClick={handleSignInWithKakao}
          disabled={isPendingKakao}
        >
          카카오 계정 로그인
        </Button>

        {/* 구글 소셜 로그인 */}
        <Button
          className='w-full cursor-pointer'
          onClick={handleSignInWithGoogle}
          disabled={isPendingGoogle}
        >
          구글 계정 로그인
        </Button>
      </div>
      <div className='flex flex-col gap-2'>
        <Link
          className='text-muted-foreground hover:underline'
          href={'/signup'}
        >
          계정이 없으시다면? 회원가입
        </Link>
        <Link
          className='text-muted-foreground hover:underline'
          href={'/forget-password'}
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>
    </div>
  );
}
```

### 2.4. `src/app/(default)/forget-password/page.tsx`

```tsx
export const metadata: Metadata = {
  title: '비밀번호 재설정 링크 받기',
  description: '가입된 이메일로 비밀번호 재설정 링크를 전송합니다.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/forget-password',
  },
};
```

```tsx
import ForgetPasswordContet from '@/components/forget-password/ForgetPasswordConent';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: '비밀번호 재설정 링크 받기',
  description: '가입된 이메일로 비밀번호 재설정 링크를 전송합니다.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/forget-password',
  },
};
export default function ForgetPassword() {
  return <ForgetPasswordContet />;
}
```

- `/src/components/forget-password 폴더` 생성
- `/src/components/forget-password/ForgetPasswordConent.tsx 파일` 생성

```tsx
'use client';

import { useRequestPasswordResetEmail } from '@/hooks/mutations/auth/useRequestPasswordResetEmail';
import { getErrorMessage } from '@/lib/error';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgetPasswordContet() {
  const [email, setEmail] = useState('');
  const { mutate, isPending } = useRequestPasswordResetEmail({
    onSuccess: () => {
      toast.info('인증 메일이 잘 발송되었습니다.', {
        position: 'top-center',
      });
      setEmail('');
    },
    onError: error => {
      const message = getErrorMessage(error);
      toast.error(message, {
        position: 'top-center',
      });
      setEmail('');
    },
  });

  const handleEmailSendClick = () => {
    if (email.trim() === '') return;
    console.log(email);
    mutate({ email });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호를 잊으셨나요?</div>
        <div className='text-muted-foreground'>
          이메일 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.
        </div>
      </div>
      <Input
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={isPending}
        className='py-6'
        type='email'
        placeholder='example@example.com'
      />
      <Button
        onClick={handleEmailSendClick}
        disabled={isPending}
        className='w-full'
      >
        {isPending ? '인증 메일 요청 중...' : '인증 메일 요청하기'}
      </Button>
    </div>
  );
}
```

### 2.5. `src/app/(protected)/post/[id]/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

async function getPostMeta(postId: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        content,
        created_at,
        image_urls,
        author:profiles (
          id,
          nickname,
          avatar_url
        )
      `
    )
    .eq('id', postId)
    .single();

  if (error || !data) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  return data;
}

export async function generateMetadata({
  params,
}: PostDetailProps): Promise<Metadata> {
  const post = await getPostMeta(Number(params.id));
  const ogImage = post.image_urls?.[0] ?? 'https://sns.devgr.kr/og-cover.png';

  return {
    title: `${post.author.nickname}의 게시글`,
    description: post.content.slice(0, 80),
    alternates: { canonical: `/post/${post.id}` },
    openGraph: {
      type: 'article',
      title: `${post.author.nickname}의 게시글`,
      description: post.content.slice(0, 120),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${post.author.nickname}의 게시글 이미지`,
        },
      ],
    },
  };
}

export default async function PostDetail({ params }: PostDetailProps) {
  const post = await getPostMeta(Number(params.id));

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SocialMediaPosting',
            headline: `${post.author.nickname}의 게시글`,
            articleBody: post.content,
            datePublished: post.created_at,
            image: post.image_urls,
            author: {
              '@type': 'Person',
              name: post.author.nickname,
              url: `https://sns.devgr.kr/profile/${post.author.id}`,
            },
          }),
        }}
      />
      {/* 기존 상세 페이지 UI */}
    </>
  );
}
```

```tsx
import CommentEditor from '@/components/comment/CommentEditor';
import CommentList from '@/components/comment/CommentList';
import PostItem from '@/components/post/PostItem';

// 웹브라우저용은 클라이언트 컴포넌트에서만...
// import { createClient } from '@/lib/supabase/client';

// 서버에서 실행하므로
import { createClient } from '@/lib/supabase/server';
import { Description } from '@radix-ui/react-dialog';
import { Metadata } from 'next';

import { redirect } from 'next/navigation';
import { cache } from 'react';

interface PostDetailProps {
  params: {
    id: string;
  };
}

interface PostMeta {
  id: number;
  content: string;
  created_at: string;
  image_urls: string[] | null;
  author: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  };
}

const siteUrl = 'https://sns.devgr.kr';
const fallbackOgImage = `${siteUrl}/assets/logo.png`;
const fallbackAvatar = `${siteUrl}/assets/icons/default-avatar.jpg`;

const fetchPostMeta = cache(async (postId: number): Promise<PostMeta> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        content,
        created_at,
        image_urls,
        author:profiles!author_id(
          id,
          nickname,
          avatar_url
        )
      `
    )
    .eq('id', postId)
    .single();

  if (error || !data) {
    throw error ?? new Error('POST_NOT_FOUND');
  }

  return data as unknown as PostMeta;
});

function buildDescription(content: string) {
  if (!content) return '게시글 상세';
  return content.length > 120 ? `${content.slice(0, 117)}...` : content;
}

export async function generateMetadata(
  props: PostDetailProps
): Promise<Metadata> {
  const resolvedParams = await props.params;
  const postId = Number(resolvedParams.id);

  if (!resolvedParams.id || Number.isNaN(postId)) {
    return {
      title: '게시글을 찾을 수 없습니다.',
      robots: { index: false, follow: false },
    };
  }

  try {
    const post = await fetchPostMeta(postId);
    const description = buildDescription(post.content);
    const ogImage = post.image_urls?.[0] ?? fallbackOgImage;

    return {
      title: `${post.author.nickname}의 게시글`,
      description,
      alternates: { canonical: `/post/${post.id}` },
      openGraph: {
        type: 'article',
        title: `${post.author.nickname}의 게시글`,
        description,
        url: `${siteUrl}/post/${post.id}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${post.author.nickname}의 게시글 이미지`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.author.nickname}의 게시글`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: '게시글을 찾을 수 없습니다.',
      robots: { index: false, follow: false },
    };
  }
}

async function PostDetail(props: PostDetailProps) {
  const resolvedParams = await props.params;
  const { id } = await resolvedParams;

  if (!id || id.trim() === '') {
    redirect('/');
  }

  const postId = Number(id);
  const post = await fetchPostMeta(postId).catch(() => null);

  if (!post) {
    redirect('/');
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: `${post.author.nickname}의 게시글`,
    articleBody: post.content,
    datePublished: post.created_at,
    image:
      post.image_urls && post.image_urls.length > 0
        ? post.image_urls
        : [fallbackOgImage],
    mainEntityOfPage: `${siteUrl}/post/${post.id}`,
    author: {
      '@type': 'Person',
      name: post.author.nickname,
      url: `${siteUrl}/profile/${post.author.id}`,
      image: post.author.avatar_url ?? fallbackAvatar,
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className='flex flex-col gap-5'>
        <PostItem postId={Number(id)} type={'DETAIL'} />
        <div className='text-xl font-bold'>댓글</div>
        <CommentEditor type='CREATE' postId={Number(id)} />
        <CommentList postId={Number(id)} />
      </div>
    </>
  );
}

export default PostDetail;
```

### 2.6. `src/app/(default)/signup/page.tsx`

```tsx
import SignupForm from '@/components/signup/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입',
  description: '간단한 정보 입력만으로 새로운 SNS 계정을 만들어보세요.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/signup' },
};

function SignUp() {
  return <SignupForm />;
}

export default SignUp;
```

- `/src/components/signup 폴더` 생성
- `/src/components/signup/SignupForm.tsx 파일` 생성

```tsx
'use client';
import { useSignUp } from '@/hooks/mutations/auth/useSignUp';
import { getErrorMessage } from '@/lib/error';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending } = useSignUp({
    onSuccess: () => {
      toast.success('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.', {
        position: 'top-center',
      });
      router.replace('/signin');
    },
    onError: error => {
      const message = getErrorMessage(error);
      toast.error(message, { position: 'top-center' });
    },
  });

  const handleSignUpClick = () => {
    if (!email.trim()) return;
    if (!password.trim()) return;
    // supabase 회원가입 처리 코드
    mutate({ email: email, password: password });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>회원가입</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          disabled={isPending}
          onChange={e => setEmail(e.target.value)}
          type='email'
          placeholder='example@example.com'
        />
        <Input
          value={password}
          disabled={isPending}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
        />
      </div>
      <div>
        <Button
          disabled={isPending}
          className='w-full'
          onClick={handleSignUpClick}
        >
          {isPending ? '회원등록중...' : '회원가입'}
        </Button>
      </div>
      <div>
        <Link
          href={'/signin'}
          className='text-muted-foreground hover:underline'
        >
          이미 계정이 있다면? 로그인
        </Link>
      </div>
    </div>
  );
}
```

## 2.7. `src/app/(protected)/reset-password/page.tsx`

```tsx
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '보안 비밀번호 재설정',
  description: '발급된 링크를 통해 안전하게 비밀번호를 재설정하세요.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/reset-password' },
};

function ResetPassword() {
  return <ResetPasswordForm />;
}

export default ResetPassword;
```

- `/src/components/reset-password 폴더` 생성
- `/src/components/reset-password/ResetPasswordForm.tsx 파일` 생성

```tsx
'use client';
import { useUpdatePassword } from '@/hooks/auth/useUpdatePassword';
import { getErrorMessage } from '@/lib/error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const { mutate: updatePassword, isPending: isUpdatePasswordPending } =
    useUpdatePassword({
      onSuccess: () => {
        toast.success('비밀번호가 성공적으로 변경되었습니다.', {
          position: 'top-center',
        });
        router.push('/');
      },
      onError: error => {
        const message = getErrorMessage(error);
        toast.error(message, {
          position: 'top-center',
        });
        setPassword('');
      },
    });
  const handleResetPasswordClick = () => {
    if (password.trim() === '') return;
    console.log(password);
    updatePassword({ password });
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1'>
        <div className='text-xl font-bold'>비밀번호 재설정하기</div>
        <div className='text-muted-foreground'>
          새로운 비밀번호를 입력하세요.
        </div>
      </div>
      <Input
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={isUpdatePasswordPending}
        className='py-6'
        type='password'
        placeholder='password'
      />
      <Button
        onClick={handleResetPasswordClick}
        disabled={isUpdatePasswordPending}
        className='w-full'
      >
        {isUpdatePasswordPending ? '비밀번호 변경 중...' : '비밀번호 변경하기'}
      </Button>
    </div>
  );
}
```

### 2.8. Robots 와 Sitemap 구성

- 검색 크롤러가 접근해야 할 경로와 차단해야 할 경로를 명확히 정의하고, 보호된 페이지를 제외한 공개 리소스를 사이트맵에 나열
- 소스 코드 경로 주의하자.
- `src/app/robots.ts`, `src/app/sitemap.ts`
- `src/app/robots.ts`

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/profile', '/post', '/reset-password', '/api/'],
      },
    ],
    sitemap: 'https://sns.devgr.kr/sitemap.xml',
  };
}
```

- `src/app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next';
import { listPublicProfiles, listPublicPosts } from '@/lib/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, posts] = await Promise.all([
    listPublicProfiles(),
    listPublicPosts(),
  ]);

  return [
    { url: 'https://sns.devgr.kr/', changeFrequency: 'daily', priority: 1 },
    ...profiles.map(profile => ({
      url: `https://sns.devgr.kr/profile/${profile.id}`,
      lastModified: profile.updated_at,
    })),
    ...posts.map(post => ({
      url: `https://sns.devgr.kr/post/${post.id}`,
      lastModified: post.updated_at,
    })),
  ];
}
```

- `src/lib/sitemap.ts` 파일 생성

```ts
import { createClient } from '@/lib/supabase/server';

interface SitemapProfile {
  id: string;
  created_at: string | null;
}

interface SitemapPost {
  id: number;
  created_at: string | null;
}

export async function listPublicProfiles(): Promise<SitemapProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function listPublicPosts(): Promise<SitemapPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data;
}
```

## 3. 성능 최적화

### 3.1. Sitemap 타입 에러 수정
- `src/app/sitemap.ts`에서 `lastModified` 속성에 `null` 값이 들어갈 수 있는 문제를 해결했습니다.
- `created_at`이 `null`일 경우 `undefined`로 처리하여 타입 안정성을 확보했습니다.

### 3.2. 이미지 최적화 (`PostItem.tsx`)
- 기존 `img` 태그를 Next.js의 `Image` 컴포넌트로 교체했습니다.
- `fill`, `sizes`, `priority` 속성을 사용하여 이미지 로딩 성능을 개선하고 레이아웃 시프트를 방지했습니다.
- 반응형 사이즈(`sizes`)를 적용하여 디바이스 크기에 맞는 최적의 이미지를 로드하도록 설정했습니다.
