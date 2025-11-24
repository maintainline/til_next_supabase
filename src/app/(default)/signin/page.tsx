import SignInContent from '@/components/signin/SignInContent';
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
