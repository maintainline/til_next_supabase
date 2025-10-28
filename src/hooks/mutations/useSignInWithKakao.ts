import { signInWithOAuth } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithKakao() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
