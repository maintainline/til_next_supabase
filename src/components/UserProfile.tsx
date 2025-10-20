/**
 * UserProfile 컴포넌트 - Zustand를 사용한 사용자 인증 기능 구현
 *
 * 이 컴포넌트는 useUserStore 훅을 사용하여 사용자 로그인/로그아웃과
 * 프로필 정보 수정 기능을 제공합니다.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUserState } from '@/stores/UserStore';

/**
 * UserProfile - 사용자 인증 및 프로필 관리 컴포넌트
 *
 * Zustand의 useUserStore 훅을 사용하여:
 * - 로그인/로그아웃 기능
 * - 사용자 정보 표시 및 수정
 * - 로딩 상태 관리
 *
 * @returns JSX.Element - 사용자 프로필 UI 컴포넌트
 */
export default function UserProfile() {
  // Zustand 스토어에서 사용자 관련 상태와 액션들을 가져옵니다
  const { user, isLoggedIn, isLoading, login, logout, updateUser, setLoading } =
    useUserState();

  // 로컬 상태: 편집 모드와 편집 중인 이름
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  /**
   * handleLogin - 로그인 처리 함수
   *
   * 로딩 상태를 true로 설정하고 1초 후 시뮬레이션된 사용자 정보로 로그인합니다.
   * 실제 프로젝트에서는 API 호출로 대체되어야 합니다.
   */
  const handleLogin = () => {
    setLoading(true);
    // 시뮬레이션된 로그인 (실제로는 API 호출)
    setTimeout(() => {
      login({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://via.placeholder.com/150',
      });
    }, 1000);
  };

  /**
   * handleLogout - 로그아웃 처리 함수
   *
   * Zustand 스토어의 logout 액션을 호출하여 사용자 정보를 초기화합니다.
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * handleUpdateName - 사용자 이름 업데이트 함수
   *
   * 편집된 이름이 유효한 경우에만 사용자 정보를 업데이트하고
   * 편집 모드를 종료합니다.
   */
  const handleUpdateName = () => {
    if (editName.trim()) {
      updateUser({ name: editName });
      setIsEditing(false);
      setEditName('');
    }
  };

  // 로딩 상태일 때 로딩 스피너 표시
  if (isLoading) {
    return (
      <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        User Profile
      </h2>

      {!isLoggedIn ? (
        // 로그아웃 상태: 로그인 버튼 표시
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>
            Please log in to view your profile
          </p>
          <button
            onClick={handleLogin}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            Login
          </button>
        </div>
      ) : (
        // 로그인 상태: 사용자 정보 표시
        <div className='space-y-4'>
          {/* 사용자 아바타 이미지 */}
          {user?.avatar && (
            <div className='text-center'>
              <Image
                src={user.avatar}
                alt='Avatar'
                width={80}
                height={80}
                className='w-20 h-20 rounded-full mx-auto'
              />
            </div>
          )}

          <div className='text-center'>
            {isEditing ? (
              // 편집 모드: 이름 수정 폼
              <div className='space-y-2'>
                <input
                  type='text'
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded'
                  placeholder='Enter new name'
                />
                <div className='space-x-2'>
                  <button
                    onClick={handleUpdateName}
                    className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName('');
                    }}
                    className='px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // 표시 모드: 사용자 정보 표시
              <div>
                <h3 className='text-xl font-semibold'>{user?.name}</h3>
                <p className='text-gray-600'>{user?.email}</p>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditName(user?.name || '');
                  }}
                  className='mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
                >
                  Edit Name
                </button>
              </div>
            )}
          </div>

          {/* 로그아웃 버튼 */}
          <div className='text-center'>
            <button
              onClick={handleLogout}
              className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
