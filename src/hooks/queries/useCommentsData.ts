import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { fetchComments } from '@/apis/comment';

export function useCommentsData(postId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.comments.post(postId),
    queryFn: async () => fetchComments(postId),
  });
}
