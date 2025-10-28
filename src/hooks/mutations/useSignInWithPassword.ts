import { signInWithPassword } from '@/apis/auth';
import { useMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithPassword(callback?: useMutationCallback) {
  return useMutation({
    mutationFn: signInWithPassword,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error);
      if (callback?.onError) callback.onError(error);
    },
  });
}
