import { requestPasswordResetEmail } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';

import { useMutation } from '@tanstack/react-query';

export function useRequestPasswordResetEmail(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: requestPasswordResetEmail,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: error => {
      console.error(error);
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
