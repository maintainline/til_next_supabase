// 아래는 주의사항 : 왜냐하면 서버에서 클라이언트로 접근해야함
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  if (!code) {
    return NextResponse.redirect(
      new URL('/signin?error=missing_code', request.url)
    );
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL('/signin?error=exchange_failed', request.url)
    );
  }
  return NextResponse.redirect(new URL(next, request.url));
}
