// 게시글 CRUD
// useQuery 와 useMutaion 활용
'use client';

import {
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from '@/hooks/usePosts';
import { useUserSelection } from '@/hooks/useQueryIntegration';
import { useState } from 'react';

const PostManager = () => {
  // 선택된 사용자 정보
  const { selectedUserId } = useUserSelection();
  // 게시글 목록을 가져옴
  const {
    data: posts,
    isLoading,
    error,
  } = usePosts(selectedUserId || undefined);

  // Mutation 훅들
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  // 컴포넌트 활용 state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [editPost, setEditPost] = useState({ title: '', body: '' });

  // 새 게시글 생성 처리
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      return;
    }
    try {
      // Mutaion 객체.mutateAsync :  비동기로 뮤테이션을 실행하는 함수 이다.
      await createPostMutation.mutateAsync({
        //number 가 들어와야해요
        userId: selectedUserId || 1,
        title: newPost.title,
        body: editPost.body,
      });
      // 성공시 내용 초기화
      setNewPost({ title: '', body: '' });
      setIsCreating(false);
    } catch (error) {
      console.log('새글 등록 실패:', error);
    }
  };

  // 게시글 수정 처리
  const handleUpdatePost = async (id: number) => {
    if (!editPost.title.trim() || !editPost.body.trim()) {
      return;
    }
    try {
      await updatePostMutation.mutateAsync({
        id,
        post: {
          title: editPost.title,
          body: editPost.body,
        },
      });

      // 성공시
      setEditPost({ title: '', body: '' });
      setEditingId(null);
    } catch (error) {
      console.log('수정에 실패했습니다.', error);
    }
  };

  // 게시글 삭제 처리
  const handleDeletePost = async (id: number) => {
    if (!confirm('게시글 삭제할래?')) {
      return;
    }
    try {
      await deletePostMutation.mutateAsync(id);
    } catch (error) {
      console.log('삭제 실패:', error);
    }
  };

  // 게시글 편집 시작
  const startEdit = (post: any) => {
    setEditingId(post.id);
    setEditPost({ title: post.title, body: post.body });
  };
  // 게시글 편집 취소
  const cancelEdit = () => {
    setEditingId(null);
    setEditPost({ title: '', body: '' });
  };

  return (
    <div className='p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-6'>
      {/* 컴포넌트 제목 */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-800'>Posts Manager</h2>

        {/* 새 게시글 생성 버튼 */}
        <button
          onClick={() => setIsCreating(true)}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Create New Post
        </button>
      </div>

      {/* 새 게시글 생성 폼 */}
      {isCreating && (
        <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Create New Post
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Title
              </label>
              <input
                type='text'
                value={newPost.title}
                onChange={e =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter post title...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Content
              </label>
              <textarea
                value={newPost.body}
                onChange={e => setNewPost({ ...newPost, body: e.target.value })}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter post content...'
              />
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending}
                className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors'
              >
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewPost({ title: '', body: '' });
                }}
                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 게시글 목록 */}
      <div>
        <h3 className='text-lg font-semibold text-gray-700 mb-4'>
          Posts ({posts?.length || 0})
        </h3>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-2 text-gray-600'>Loading posts...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className='text-center text-red-600 py-8'>
            <p className='text-lg font-semibold'>Error loading posts</p>
            <p className='text-sm mt-1'>{error.message}</p>
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
                {editingId === post.id ? (
                  // 편집 모드
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Title
                      </label>
                      <input
                        type='text'
                        value={editPost.title}
                        onChange={e =>
                          setEditPost({ ...editPost, title: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Content
                      </label>
                      <textarea
                        value={editPost.body}
                        onChange={e =>
                          setEditPost({ ...editPost, body: e.target.value })
                        }
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        disabled={updatePostMutation.isPending}
                        className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition-colors'
                      >
                        {updatePostMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className='px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // 표시 모드
                  <div>
                    <h4 className='font-semibold text-gray-800 mb-2'>
                      {post.title}
                    </h4>
                    <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                      {post.body}
                    </p>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>
                        Post ID: {post.id}
                      </span>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => startEdit(post)}
                          className='px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletePostMutation.isPending}
                          className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 transition-colors'
                        >
                          {deletePostMutation.isPending
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 게시글이 없을 때 */}
        {posts && posts.length === 0 && !isLoading && (
          <div className='text-center py-8 text-gray-500'>
            <p>No posts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManager;
