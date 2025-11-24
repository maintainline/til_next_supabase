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
