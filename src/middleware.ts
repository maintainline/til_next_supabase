import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 사용자가 어느 주소로 왔는가?
  const { pathname } = request.nextUrl;

  // reset-password 경로 특별 처리
  if (pathname === '/reset-password') {
    const { supabase, response } = createClient(request);

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // recovery 세션이 없으면 signin으로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // recovery 세션이 있으면 통과
    return response;
  }

  // 루트 경로 접근 시 세션 체크
  if (pathname === '/') {
    const { supabase, response } = createClient(request);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 세션이 없으면 signin으로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // 세션이 있으면 통과
    return response;
  }

  // 다른 경로는 그대로 통과
  return NextResponse.next();
}

export const config = {
  matcher: ['/reset-password', '/'],
};
