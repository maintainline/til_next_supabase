import { signInWithPassword } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithPassword() {
  return useMutation({
    mutationFn: signInWithPassword,
  });
}
