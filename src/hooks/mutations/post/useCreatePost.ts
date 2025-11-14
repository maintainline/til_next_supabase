import { createPostWithImages } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePost(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostWithImages,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
      // 1. 캐시 아예 초기화
      queryClient.resetQueries({ queryKey: QUERY_KEYS.posts.list });
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
