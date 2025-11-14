# RLS

- 포스트 인가 설정하기
- 합당한 권한이 있는 사람만 사용

## 1. 인가

- Authorization
- `인증된 사용자의 권한을 확인하는 과정`
- 인가를 post 기능에 적용해 보자.
- supabase 에제 제공하는 RLS 를 활용해야 한다.

## RLS (행 수준 보안)

### 1. RLS 설정

- supabase 에서 post 에서 진행
- RLS 사용에 체크

### 2. Authentication > Policies 설정 진입

- posts > create Policy > `Anyone can select post` > select > default > `true` > 저장

- posts > create Policy > `AAuthenticated users can createpost` > `insert` > `authenticated` > `(select auth.uid()) = author_id` > 저장

- posts > create Policy > `Authenticated can upate own post` > `update` > `authenticated` > `(select auth.uid()) = author_id` > `(select auth.uid()) = author_id` > 저장

- posts > create Policy > `AAutheicated users can delete won poast` > `delete` > `authenticated` > `(select auth.uid()) = author_id` > 저장

- 테스트 해보기
