// 선택된 사용자의 상세 정보를 표시하는 컴포넌트
'use client';

import { usePosts } from '@/hooks/usePosts';
import { useUserSelection } from '@/hooks/useQueryIntegration';

const UserDetail = () => {
  // 선택된 사용자 정보를 가져옴
  const {
    selectedUserId,
    selectedUser,
    isLoading: userLoading,
    error: userError,
  } = useUserSelection();

  // 선택된 사용자 게시글 가져옴
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts(selectedUserId || undefined);

  // 사용자가 선택되지 않았을때 안내 메세지
  if (selectedUserId) {
    return (
      <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center text-gray-500'>
          <div className='mb-4'>
            <svg
              className='w-16 h-16 mx-auto text-gray-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            No User Selected
          </h3>
          <p className='text-sm'>
            Please select a user from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  // 사용자 정보가 있으면 사용자 상세 정보 로딩중...
  if (userLoading) {
    return (
      <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading user details...</p>
        </div>
      </div>
    );
  }

  // 사용자 정보 가져오다가 에러라면?
  if (userError) {
    return (
      <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center text-red-600'>
          <p className='text-lg font-semibold'>Error loading user</p>
          <p className='text-sm mt-1'>{userError.message}</p>
        </div>
      </div>
    );
  }

  // 사용자 정보 및 posts 출력
  return (
    <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-6'>
      {/* 사용자 기본 정보 */}
      <div className='border-b border-gray-200 pb-6'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>User Details</h2>

        {selectedUser && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 기본 정보 */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                  Basic Information
                </h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Name:
                    </span>
                    <p className='text-gray-800'>{selectedUser.name}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Email:
                    </span>
                    <p className='text-gray-800'>{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Phone:
                    </span>
                    <p className='text-gray-800'>{selectedUser.phone}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Website:
                    </span>
                    <a
                      href={`https://${selectedUser.website}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 hover:underline'
                    >
                      {selectedUser.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 회사 정보 */}
            <div className='space-y-4'>
              <div>
                <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                  Company Information
                </h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Company:
                    </span>
                    <p className='text-gray-800'>{selectedUser.company.name}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Catch Phrase:
                    </span>
                    <p className='text-gray-800 italic'>
                      &ldquo;{selectedUser.company.catchPhrase}&rdquo;
                    </p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>
                      Business:
                    </span>
                    <p className='text-gray-800'>{selectedUser.company.bs}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 사용자의 게시글 목록 */}
      <div>
        <h3 className='text-xl font-semibold text-gray-700 mb-4'>
          Posts ({posts?.length || 0})
        </h3>

        {/* 게시글 로딩 중 */}
        {postsLoading && (
          <div className='text-center py-4'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-2 text-sm text-gray-600'>Loading posts...</p>
          </div>
        )}

        {/* 게시글 에러 */}
        {postsError && (
          <div className='text-center text-red-600 py-4'>
            <p className='text-sm'>Error loading posts: {postsError.message}</p>
          </div>
        )}

        {/* 게시글 목록 */}
        {posts && posts.length > 0 && (
          <div className='space-y-4'>
            {posts.map(post => (
              <div
                key={post.id}
                className='p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all'
              >
                <h4 className='font-semibold text-gray-800 mb-2'>
                  {post.title}
                </h4>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {post.body}
                </p>
                <div className='mt-3 pt-3 border-t border-gray-100'>
                  <span className='text-xs text-gray-500'>
                    Post ID: {post.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 게시글이 없을 때 */}
        {posts && posts.length === 0 && !postsLoading && (
          <div className='text-center py-8 text-gray-500'>
            <p>No posts found for this user</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
