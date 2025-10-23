// 테스트 컴포넌트
'use client';
import { usePrefetchQuery } from '@/hooks/useQueryIntegration';
import { useState } from 'react';
import UsersList from './UsersList';
import UserDetail from './UserDetail';
import PostManager from './PostManager';

function ReactQueryDemo() {
  // 프리패치 기능으로 데이터를 사용자가 필요한 것을 예측 캐싱
  const { prefetchUser, prefetchUserPosts, prefetchPost } = usePrefetchQuery();

  // 컴포넌트 상태로서 프리패치 데모용
  const [prefetchUserId, setPrefetchUserId] = useState(1);
  const [prefetchPostId, setPrefetchPostId] = useState(1);

  return (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* 페이지 헤더 */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            React Query Demo
          </h1>
          <p className='text-lg text-gray-600'>
            React Query를 활용한 현대적인 서버 상태 관리 예제
          </p>
        </div>

        {/* 프리페치 데모 섹션 */}
        <div className='mb-8 p-6 bg-blue-50 rounded-xl'>
          <h2 className='text-xl font-semibold text-blue-800 mb-4'>
            🚀 Prefetch Demo
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* 사용자 프리페치 */}
            <div className='bg-white p-4 rounded-lg'>
              <h3 className='font-semibold text-gray-700 mb-2'>
                Prefetch User
              </h3>
              <div className='space-y-2'>
                <input
                  type='number'
                  value={prefetchUserId}
                  onChange={e => setPrefetchUserId(Number(e.target.value))}
                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                  placeholder='User ID'
                />
                <button
                  onClick={() => prefetchUser(prefetchUserId)}
                  className='w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors'
                >
                  Prefetch User
                </button>
              </div>
            </div>

            {/* 게시글 프리페치 */}
            <div className='bg-white p-4 rounded-lg'>
              <h3 className='font-semibold text-gray-700 mb-2'>
                Prefetch Post
              </h3>
              <div className='space-y-2'>
                <input
                  type='number'
                  value={prefetchPostId}
                  onChange={e => setPrefetchPostId(Number(e.target.value))}
                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                  placeholder='Post ID'
                />
                <button
                  onClick={() => prefetchPost(prefetchPostId)}
                  className='w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors'
                >
                  Prefetch Post
                </button>
              </div>
            </div>

            {/* 사용자 게시글 프리페치 */}
            <div className='bg-white p-4 rounded-lg'>
              <h3 className='font-semibold text-gray-700 mb-2'>
                Prefetch User Posts
              </h3>
              <div className='space-y-2'>
                <input
                  type='number'
                  value={prefetchUserId}
                  onChange={e => setPrefetchUserId(Number(e.target.value))}
                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                  placeholder='User ID'
                />
                <button
                  onClick={() => prefetchUserPosts(prefetchUserId)}
                  className='w-full px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors'
                >
                  Prefetch Posts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* 사용자 목록 */}
          <div>
            <UsersList />
          </div>

          {/* 선택된 사용자 상세 정보 */}
          <div>
            <UserDetail />
          </div>
        </div>

        {/* 게시글 관리 섹션 */}
        <div className='mt-8'>
          <PostManager />
        </div>
      </div>
    </div>
  );
}

export default ReactQueryDemo;
