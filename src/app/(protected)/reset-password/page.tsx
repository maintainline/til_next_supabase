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
