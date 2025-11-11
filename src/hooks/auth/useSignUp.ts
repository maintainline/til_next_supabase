import { signUpWithEmail } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useSignUp(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: signUpWithEmail,
    onError: error => {
      console.error(error.message);
      if (callback?.onError) callback.onError(error);
    },
  });
}
