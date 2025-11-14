import { deleteImagesInPath } from '@/apis/image';
import { deletePost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useDeletePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: deletePost,

    // mutationFN 의 리턴값을 활용
    onSuccess: async deletedPost => {
      if (callback?.onSuccess) callback.onSuccess();

      if (deletedPost.image_urls && deletedPost.image_urls.length > 0) {
        await deleteImagesInPath(`${deletedPost.author_id}/${deletedPost.id}`);
      }
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
