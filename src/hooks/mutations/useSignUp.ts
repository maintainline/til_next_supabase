import { signUpWithEmail } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignUp() {
  return useMutation({
    mutationFn: signUpWithEmail,
  });
}
