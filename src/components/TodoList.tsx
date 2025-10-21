/**
 * TodoList 컴포넌트 - Zustand를 사용한 할일 목록 기능 구현
 *
 * 이 컴포넌트는 useTodoStore 훅을 사용하여 할일 목록의 CRUD 작업과
 * 필터링 기능을 제공합니다.
 */

'use client';
import { useTodoStore } from '@/stores/TodoStore';
import { useState } from 'react';

/**
 * TodoList - 할일 목록 관리 컴포넌트
 *
 * Zustand의 useTodoStore 훅을 사용하여:
 * - 할일 추가/수정/삭제/완료 토글
 * - 필터링 (전체/활성/완료)
 * - 완료된 할일 일괄 삭제
 *
 * @returns JSX.Element - 할일 목록 UI 컴포넌트
 */
export default function TodoList() {
  // Zustand 스토어에서 할일 관련 상태와 액션들을 가져옵니다
  const {
    todos,
    filter,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    setFilter,
    clearCompleted,
    getFilteredTodos,
  } = useTodoStore();

  // 로컬 상태: 새 할일 입력과 편집 중인 할일
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  /**
   * handleAddTodo - 새 할일 추가 처리
   *
   * 입력된 텍스트가 유효한 경우 새 할일을 추가하고 입력 필드를 초기화합니다.
   */
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  /**
   * handleEditStart - 할일 편집 시작
   *
   * @param id - 편집할 할일의 ID
   * @param text - 현재 할일 내용
   *
   * 편집 모드를 활성화하고 현재 텍스트를 편집 필드에 설정합니다.
   */
  const handleEditStart = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  /**
   * handleEditSave - 할일 편집 저장
   *
   * 편집된 텍스트가 유효한 경우 할일을 업데이트하고 편집 모드를 종료합니다.
   */
  const handleEditSave = () => {
    if (editingId && editingText.trim()) {
      updateTodo(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    }
  };

  /**
   * handleEditCancel - 할일 편집 취소
   *
   * 편집 모드를 취소하고 편집 상태를 초기화합니다.
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 현재 필터에 맞는 할일 목록 가져오기
  const filteredTodos = getFilteredTodos();

  return (
    <div className='p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      {/* 컴포넌트 제목 */}
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        Todo List
      </h2>

      {/* 새 할일 추가 폼 */}
      <div className='flex space-x-2'>
        <input
          type='text'
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddTodo()}
          placeholder='Add a new todo...'
          className='flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <button
          onClick={handleAddTodo}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          Add
        </button>
      </div>

      {/* 필터 버튼들 */}
      <div className='flex space-x-2'>
        {(['all', 'active', 'completed'] as const).map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* 할일 목록 */}
      <div className='space-y-2'>
        {filteredTodos.length === 0 ? (
          <p className='text-center text-gray-500 py-4'>
            {filter === 'all' ? 'No todos yet' : `No ${filter} todos`}
          </p>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              className='flex items-center space-x-2 p-3 border border-gray-200 rounded hover:bg-gray-50'
            >
              {/* 완료 상태 토글 체크박스 */}
              <input
                type='checkbox'
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
              />

              {/* 할일 내용 */}
              <div className='flex-1'>
                {editingId === todo.id ? (
                  // 편집 모드: 입력 필드
                  <input
                    type='text'
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleEditSave()}
                    className='w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    autoFocus
                  />
                ) : (
                  // 표시 모드: 할일 텍스트
                  <span
                    className={`${
                      todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className='flex space-x-1'>
                {editingId === todo.id ? (
                  // 편집 모드: 저장/취소 버튼
                  <>
                    <button
                      onClick={handleEditSave}
                      className='px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600'
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className='px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600'
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  // 표시 모드: 편집/삭제 버튼
                  <>
                    <button
                      onClick={() => handleEditStart(todo.id, todo.text)}
                      className='px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className='px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600'
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 및 액션 */}
      <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          {todos.filter(todo => !todo.completed).length} active,{' '}
          {todos.filter(todo => todo.completed).length} completed
        </div>
        {todos.some(todo => todo.completed) && (
          <button
            onClick={clearCompleted}
            className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors'
          >
            Clear Completed
          </button>
        )}
      </div>
    </div>
  );
}
