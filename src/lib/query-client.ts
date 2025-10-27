import { QueryClient } from '@tanstack/react-query';

/*
핵심 내용 설정 
 - 서버 상태 관리를 위한 모든 기능을 제공함.
 - 캐싱 : API 응답을 메모리에 저장하여 중복 요청 방지
 - 동기화 : 서버와 클라이언트 상태 동기화
 - 백그라운드 업데이트 : 데이터 자동 갱신
 - 에러 처리 : 네트워크 오류 및 서버 오류 처리
 **/
export const queryClinet = new QueryClient();
