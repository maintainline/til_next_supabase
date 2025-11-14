import { deleteImagesInPath } from '@/apis/image';
import { deletePost } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { UseMutationCallback } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeletePost(callback?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: async deletedPost => {
      if (callback?.onSuccess) callback.onSuccess();

      if (deletedPost.image_urls && deletedPost.image_urls.length > 0) {
        await deleteImagesInPath(`${deletedPost.author_id}/${deletedPost.id}`);
      }

      // 무한 스크롤 때문에 이렇게 리셋을 한 것이다.
      // 여러개를 불러들일 수도 있기 때문에
      queryClient.resetQueries({ queryKey: QUERY_KEYS.posts.list });
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
