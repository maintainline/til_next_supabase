import { signInWithOAuth } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
