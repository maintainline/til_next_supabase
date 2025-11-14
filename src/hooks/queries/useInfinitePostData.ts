import { fetchPosts } from '@/apis/post';
import { QUERY_KEYS } from '@/lib/constants';
import { useInfiniteQuery } from '@tanstack/react-query';

// 하나의 페이지마다 불러들일 개수
const PAGE_SIZE = 5;

export function useInfinitePostData() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const posts = await fetchPosts({ from, to });
      return posts;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
}
