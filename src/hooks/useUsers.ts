// 사용자 목록을 관리하는 React Query 훅
// 사용자 목록을 가져오고 관리하는 기능을 제공함.
// React Query 의  useQuery 를 활용함.
// 캐싱, 로딩, 에러 처리를 자동화 함.

import { fetchUser, fetchUsers } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

/* 사용자 목록 가져오기
 * - 사용자 목록 자동 로딩
 * - 로딩 상태 관리
 * - 에러 상태 관리
 * - 데이터 캐싱
 * - 자동 리페치
 **/
export function useUsers() {
  // useQuery :  정보가져오기
  return useQuery({
    // 쿼리 키 : 데이터 캐싱 구별을 위한 키값을 설정
    queryKey: ['users'],
    // 쿼리함수 : 실제 데이터를 가져오는 함수 연결
    queryFn: fetchUsers,
    // 쿼리 개별 옵션
    staleTime: 5 * 60 * 1000, // 5분간은 호출을 막는다. 즉 fresh 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시를 유지함.
  });
}
// 각 사용자, 즉 특정 사용자 정보 가져옹는 훅
export function useUser(id: number) {
  //ID 가 유효한지 검사 (id가 null, undefined,0 이하면)
  const isValidId = (id: number) => {
    return id !== null && id !== undefined && id > 0;
  };
  // useQuery : 정보 호출
  return useQuery({
    //쿼리의 구분을 위한 Key 생성
    queryKey: ['users', id],
    //실행할 함수
    queryFn: () => fetchUser(id),
    // 사용자 ID가 null, undefined, 0 보다 작으면 실행되지 않도록
    enabled: isValidId(id),
    // 쿼리 옵션
    staleTime: 5 * 60 * 1000, // 5분간은 호출을 막는다, 즉 fresh 유지
    gcTime: 10 * 60 * 1000, // 10 분간 캐시를 유지함
  });
}

// 사용자와 해당 사용자의 게시글을 함께 가져오는 훅
export function useUserWithPosts() {
  // 먼저 사용자 목록을 가져옴
  const usersQuery = useUsers();

  // 사용자 목록이 성공적으로 로드가 된 경우에만 게시글 가져옴
  const postsQueries = useQuery({
    // Query 구분용 Key 생성
    queryKey: ['users', 'posts'],
    // 호출시 실행할 함수 생성
    queryFn: async () => {
      // 사용자들이 없다면 비어있는 배열을 리턴한다.
      // 상위에서 if 문등의 조건을 이용하면 정확히 자료가 있다는
      // 타입좁히기 또는 타입가드가 적용됨
      if (!usersQuery.data || usersQuery.data.length === 0) return [];

      // 사용자들이 있다면 모든 사용자의 게시글을 가져옴
      // 여러명의 사용자가 있을 것이다. 그래서 병렬로 자료를 가져옴
      const postsPromises = usersQuery.data.map(user =>
        fetch(
          `https://jsonplaceholder.typicode.com/posts?userId=${user.id}`
        ).then(res => res.json())
      );

      const allPosts = await Promise.all(postsPromises);

      // 사용자별 게시글을 그룹화한다.
      return usersQuery.data.map((user, index) => ({
        ...user,
        posts: allPosts[index],
      }));
    },
    // 사용자 목록이 성공적으로 로드된 경우에만 실행하라
    enabled: usersQuery.isSuccess,
  });

  return {
    ...postsQueries,
    // 원본 사용자 쿼리 정보도 함께 반환
    usersQuery,
  };
}
