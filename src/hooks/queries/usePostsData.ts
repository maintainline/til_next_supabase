import { fetchPosts } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export function usePostsData() {
  return useQuery({
    queryKey: QUERY_KEYS.posts.list,
    queryFn: () => fetchPosts(),
  });
}
