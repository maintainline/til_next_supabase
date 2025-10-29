import { signInWithOAuth } from '@/apis/auth';
import { useMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithGoogle(callback?: useMutationCallback) {
  return useMutation({
    mutationFn: signInWithOAuth,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error);
      if (callback?.onError) callback.onError(error);
    },
  });
}
