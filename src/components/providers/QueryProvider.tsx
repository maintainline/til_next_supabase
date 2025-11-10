/*
QueryClient 를 App 전체에 제공함
- 모든 하위 컴포넌트에서 useQuery, useMutaion 등의 훅을 사용할 수있게함
 **/
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // React 라면 아래 설정은 달라집니다.
  // 현재 Next.js 에다가 셋팅을 진행함.
  // 서버 사이드 렌더링을 위한 QueryClient 인스턴스 생성
  // 각 요청마다 새로운 QueryClient 를 생성하여 상태 구분함.
  const [client, setClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* npm run dev 상태에서만 개발자 도구 보기 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition='bottom-right'
        />
      )}
    </QueryClientProvider>
  );
}
