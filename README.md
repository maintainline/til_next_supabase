# comment table 작업

## 1. 테이블 설정

- 테이블 명 : `comments`
- RLS : `활성화해 둠`

### 1.1. 칼럼 설정

- `id` : 기본대로 둠
- `created_at` : 기본대로 둠
- `content` > `text` > `Set as Empty String` > `Not null`
- `author_id` > `uuid` > `auth.uid()` > `Not null`
- `post_id` > `int8` > `null` > `Not null`

### 1.2. FK 설정

- `public` > `posts` > public.comments : `post_id` > public.posts : `id` > `Cascade` > `Cascade` > 저장
- `public` > `profiles` > public.comments : `author_id` > public.profiles : `id` > `Cascade` > `Cascade` > 저장

### 1.3. RLS 설정

- `Authentication` > `Policies` > `comments` > create policy 버튼 클릭

- `Anyone can select comment` > `SELECT` > `Default` > `true` > 저장
- `Users can insert comment` > `INSERT` > `authenticated` > `(select auth.uid()) = author_id` > 저장
- `Users can update comment` > `UPDATE` > `authenticated` > `(select auth.uid()) = author_id` > `(select auth.uid()) = author_id` > 저장
- `Users can delete comment` > `DELETE` > `authenticated` > `(select auth.uid()) = author_id` > 저장

## 2. 타입 생성

- supabase 로그인 후 진행.

```bash
npx supabase login
npm run generate-types
```

## 3. 타입 정리

- `src/types/types.ts`

```ts
// 댓글 기능
export type CommentEntity = Database['public']['Tables']['comments']['Row'];
export type InsertCommentEntity =
  Database['public']['Tables']['comments']['Insert'];
export type UpdateCommentEntity =
  Database['public']['Tables']['comments']['Update'];
export type CommentTableEntity = Database['public']['Tables']['comments'];
```
