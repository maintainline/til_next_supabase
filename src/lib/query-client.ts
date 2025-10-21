import { QueryClient } from '@tanstack/react-query';

/*
핵심 내용 설정 
 - 서버 상태 관리를 위한 모든 기능을 제공함.
 - 캐싱 : API 응답을 메모리에 저장하여 중복 요청 방지
 - 동기화 : 서버와 클라이언트 상태 동기화
 - 백그라운드 업데이트 : 데이터 자동 갱신
 - 에러 처리 : 네트워크 오류 및 서버 오류 처리
 **/
export const queryClinet = new QueryClient({
  defaultOptions: {
    // 데이터 읽기 관련 설정
    queries: {
      // 데이터가 오래된 것으로 간주하는 시간 (5 분)
      staleTime: 5 * 60 * 1000,

      // 캐시에서 데이터를 제거하는 시간 (10 분)
      gcTime: 10 * 60 * 1000,

      // 자동으로 데이터를 다시 가져오는 간격 (비활성화)
      refetchInterval: false,

      // 윈도우 포커스 시 자동 리페치 (활성화)
      refetchOnWindowFocus: true,

      // 네트워크 재연결시 자동 리페치 (활성화)
      refetchOnReconnect: true,

      // 에러 발생시 재시도 횟수 (3회)
      retry: 3,

      // 재시도 간격
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    // 데이터 수정 관련 설정
    mutations: {
      // 뮤테이션 에러 발생시 재시도 횟수 (1회)
      retry: 1,

      // 큐테이션 재시도 간격
      retryDelay: 1000,
    },
  },
});
