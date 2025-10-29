import { signUpWithEmail } from '@/apis/auth';
import { useMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useSignUp(callback?: useMutationCallback) {
  return useMutation({
    mutationFn: signUpWithEmail,
    // 자동으로 error 전달받음
    onError: error => {
      console.error(error.message);
      if (callback?.onError) callback.onError(error);
    },
  });
}
