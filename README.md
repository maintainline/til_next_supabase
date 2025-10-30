# Zustand 와 Supabase Auth

## 1. 참조

- supabase 계정에따라서 type 생성 오류 발생함
- supabase 로그인 이후 진행

```bash
npx supabase login
```

## 2. 리액트와 Next.js 는 다르다

- Supabase 는 React 라면 Localstorage 에 로그인 정보 보관
- Supabase 는 Next 라면 cookie 에 로그인 정보 보관

## 3. zustand 로 관리하기

### 3.1. stores 만들기

- `/src/stores 폴더` 생성
- `/src/stores/session.ts 파일` 생성
- 단계 1.
