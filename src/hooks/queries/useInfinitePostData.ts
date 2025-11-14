import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { fetchPosts } from '@/apis/post';
const PAGE_SIZE = 5;

export function useInfinitePostData() {
  // 1. 쿼리클라이언트 불러오기
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.posts.list,

    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const posts = await fetchPosts({ from, to });

      //2. 캐시 저장
      posts.forEach(post => {
        queryClient.setQueryData(QUERY_KEYS.posts.byId(post.id), post);
      });

      //3. 리턴
      //return posts;
      return posts.map(post => post.id);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    //옵션들 : stale 상태로 안감
    staleTime: Infinity,
  });
}
