import supabase from '@/lib/supabase/client';
import type { Provider } from '@supabase/auth-js';

// supabase 백엔드에 사용자 이메일 회원가입
export async function signUpWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 웹브라우저를 이용해서 이메일 회원가입
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;

  return data;
}

// supabase 백엔드에 사용자 이메일 로그인
export async function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 레퍼런스 참조
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 이 부분이 에러의 대한 정보를 가지고 있음.
  if (error) throw error;

  return data;
}

// supabase 백엔드에 소셜 로그인
export async function signInWithOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) throw error;
  return data;
}

// supabase 의 비밀번호 찾기 이메일을 전송함.
export async function requestPasswordResetEmail({ email }: { email: string }) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });
  if (error) throw error;
  return data;
}

// 비밀번호 재설정
export async function updatePassword({ password }: { password: string }) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
  return data;
}
