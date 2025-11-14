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
    // 다음 페이지 번호 계산용 함수
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지라면
      if (lastPage.length < PAGE_SIZE) return undefined;
      // 첫 페이지 즉 initialPageParam 가 0으로 출발
      // 다음 페이지는 allPages.length 가 됩니다.
      // 첫 페이지 0 출력후 1로 증가
      // 두번째 페이지 1 출력후 2로 증가
      return allPages.length;
    },
  });
}
