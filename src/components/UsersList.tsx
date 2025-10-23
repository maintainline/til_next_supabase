// 사용자 목록 컴포넌트
// useQuery 를 사용해서 사용자 목록가져오고 표시함.
// 로딩상태, 에러상태, 데이터 표시 처리
'use client';
import { useUserSelection } from '@/hooks/useQueryIntegration';
import { useUser, useUsers } from '@/hooks/useUsers';

const UsersList = () => {
  // 사용자 목록 가져오기
  // useQuery 를 활용하면 리턴으로 다양한 정보 객체를 전달해줌.
  // data 리턴되는 값, isLoading 로딩상태, error 에러
  const { data: users, isLoading, error } = useUsers();

  // 사용자 선택 기능을 가져오기
  const { selectedUserId, selectUser, clearSelection } = useUserSelection();

  // 상황에 따라서 출력을 달리함.
  // 로딩 상태일 때
  if (isLoading) {
    return (
      <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading users...</p>
        </div>
      </div>
    );
  }
  // 에러 상태일 때
  if (error) {
    return (
      <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center text-red-600'>
          <p className='text-lg font-semibold'>Error loading users</p>
          <p className='text-sm mt-1'>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      {/* 컴포넌트 제목 */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-800'>
          Users List ({users?.length || 0})
        </h2>

        {/* 선택된 사용자가 있을 때 선택 해제 버튼 */}
        {selectedUserId && (
          <button
            onClick={clearSelection}
            className='px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors'
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* 사용자 목록 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {users?.map(user => (
          <div
            key={user.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedUserId === user.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => selectUser(user.id)}
          >
            {/* 사용자 기본 정보 */}
            <div className='space-y-2'>
              <h3 className='font-semibold text-gray-800'>{user.name}</h3>
              <p className='text-sm text-gray-600'>{user.email}</p>
              <p className='text-sm text-gray-500'>{user.phone}</p>

              {/* 회사 정보 */}
              <div className='pt-2 border-t border-gray-100'>
                <p className='text-xs text-gray-500'>Company</p>
                <p className='text-sm font-medium text-gray-700'>
                  {user.company.name}
                </p>
                <p className='text-xs text-gray-500 italic'>
                  &ldquo;{user.company.catchPhrase}&rdquo;
                </p>
              </div>

              {/* 웹사이트 */}
              <div className='pt-2'>
                <a
                  href={`https://${user.website}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-blue-600 hover:text-blue-800 hover:underline'
                  onClick={e => e.stopPropagation()} // 부모 클릭 이벤트 방지
                >
                  {user.website}
                </a>
              </div>
            </div>

            {/* 선택 상태 표시 */}
            {selectedUserId === user.id && (
              <div className='mt-3 pt-2 border-t border-blue-200'>
                <div className='flex items-center text-blue-600'>
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium'>Selected</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 사용자 목록이 비어있을 때 */}
      {users?.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          <p>No users found</p>
        </div>
      )}
    </div>
  );
};

export default UsersList;
