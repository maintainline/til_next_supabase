// 사용자 목록을 관리하는 React Query 훅
// 사용자 목록을 가져오고 관리하는 기능을 제공함.
// React Query의 useQuery 를 활용함.
// 캐싱, 로딩, 에러처리를 자동화홤.

import { fetchUsers } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

/**
 * 사용자 목록 가져오기
 * - 사용자 목록 자동로딩
 * - 로딩 상태 관리
 * - 에러 상태 관리
 * - 데이터 캐싱
 * - 자동 리패치
 * */

export function useUsers() {
  return useQuery({
    // 쿼리 키 : 데이터 캐싱 구별을 위한 키 값을 설정
    queryKey: ['users'],
    // 쿼리 함수 : 실제 데이터를 가져오는 함수 연결
    queryFn: fetchUsers,
    // 쿼리 개별 옵션
    staleTime: 5 * 60 * 1000, // 5분간은 호출을 막는다. 즉 fresh 유지
    gcTime: 10 * 60 * 1000, // 10 분간 캐시를 유지함.
  });
}
