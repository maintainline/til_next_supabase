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
