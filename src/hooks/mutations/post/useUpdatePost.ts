import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { Post, UseMutationCallback } from '@/types/types';

export function useUpdatePost(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: updatedPost => {
      if (callback?.onSuccess) callback.onSuccess();
      // 현재 업데이트 된 캐시 데이터만 업데이트해주면된다.
      queryClient.setQueryData<Post>(
        QUERY_KEYS.posts.byId(updatedPost.id),
        prevPost => {
          if (!prevPost)
            throw new Error(
              `${updatedPost.id} 에 해당하는 포스트를 캐시 데이터에서 찾을 수 없습니다.`
            );
          return {
            ...prevPost,
            ...updatedPost,
          };
        }
      );
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
