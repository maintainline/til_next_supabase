import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPostById } from '@/apis/post';

// 매겨변수의 순서가 중요하므로
export function usePostByIdData({
  postId,
  type,
}: {
  postId: number;
  type: 'FEED' | 'DETAIL';
}) {
  return useQuery({
    queryKey: QUERY_KEYS.posts.byId(postId),
    queryFn: () => fetchPostById(postId),
    enabled: type === 'FEED' ? false : true,
  });
}
