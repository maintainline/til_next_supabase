/**
 * API 함수들 - 서버와의 통신을 위한 함수들
 * 실제 API 호출을 담당하는 함수 정의
 * 실제 프로젝트에서는 axios, fetch 등을 사용해서 구현함.
 */

// 타입 정의
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

//사용자 목록 가져오기 API
export async function fetchUsers(): Promise<User[]> {
  // vanila js 활용 (Next.js 의 fetch 아님)
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) {
    throw new Error('사용자 목록 가져오기 실패');
  }
  return response.json();
}

// 특정 사용자 정보 가져오기
export async function fetchUser(id: number): Promise<User> {
  // vanila js 활용 (Next.js 의 fetch 아님)
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );

  if (!response.ok) {
    throw new Error(`${id} 사용자 목록 가져오기 실패`);
  }

  return response.json();
}

// 게시글 목록 가져오기
// 전체 가져오기 기능
// 또는 각 사용자별 가져오기 기능
export async function fetchPosts(userId?: number): Promise<Post[]> {
  const url = userId
    ? `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
    : 'https://jsonplaceholder.typicode.com/posts';

  // vanila js 활용 (Next.js 의 fetch 아님)
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`게시글 목록 가져오기 실패`);
  }

  return response.json();
}

// 특정 게시글 상세 정보를 가져오기
export async function fetchPost(id: number): Promise<Post> {
  // vanila js 활용 (Next.js 의 fetch 아님)
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );

  if (!response.ok) {
    throw new Error(`${id} 게시글 상세정보 가져오기 실패`);
  }

  return response.json();
}

// 특정 게시글의 댓글 가져오기
export async function fetchComments(postId: number): Promise<Comment[]> {
  // vanila js 활용 (Next.js 의 fetch 아님)
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}/comments`
  );

  if (!response.ok) {
    throw new Error(`${postId} 게시글 댓글 가져오기 실패`);
  }

  return response.json();
}

// 할일 목록 가져오기
export async function fetchTodos(userId?: number): Promise<Todo[]> {
  const url = userId
    ? `https://jsonplaceholder.typicode.com/todos?userId=${userId}`
    : 'https://jsonplaceholder.typicode.com/todos';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }

  return response.json();
}

// 새 게시글 생성하는 함수
export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

// 게시글 수정하는 함수

export async function updatePost(
  id: number,
  post: Partial<Post>
): Promise<Post> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update post ${id}`);
  }

  return response.json();
}

// 게시글 삭제하는 함수

export async function deletePost(id: number): Promise<void> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete post ${id}`);
  }
}
