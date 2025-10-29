# Zustand middleware

- 특정 로직에 `중간에 관여하여 추가 작업` 후 다음 로직 실행하는 단계
- 회원가입 로직에 순차적 `중간 단계에, 로그, 중복 확인 등 처리`하고 결과 리턴
- 5개의 middleware 에 대한 이해 필요.
- store 생성시 `중간 단계에서 middleware 작동 후` 결과 리턴
- `middleware 적용 순서가 엄청 중요함`

## 1. Middleware 종류

- combine : Store 의 `State 타입을 자동으로 추론` (Action 타입은 별도)
- immer : Store 의 State 가 객체, 배열, 중첩객체, 중첩배열 등 복잡한 경우 활용
- subscribeWithSelector : Store 내부의 특정 값 변화 시, 이벤트 핸들러 호출
- persist : Store 의 값을 모두 로컬 또는 세션 등에 Storage 에 보관 옵션
- devtools : Store 의 값을 개발자 도구에서 확인하며 디버그 진행시 활용

## 2. combine

- `/src/stores/Count.ts`
- `결합한다` 는 의미
- create 로 store 생성시 `state` 와 `actions`를 한개의 객체로 만들지 않겠다.
- `state` 와 `actions` 를 분리해서 작성하고, 결합시키는 방식으로 정의

### 2.1. 작성 순서

- 단계 1.

```ts
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

create( combine( 스토어에 포함될 state 객체, 콜백함수 ) );
```

- 단계 2

```ts
create(combine({ count: 0 }, 콜백함수));
```

- 단계 3

```ts
create(combine({ count: 0 }, () => {}));
```

- 단계 4

```ts
// create(combine({ count: 0 }, (set, get) => (리턴객체))); - 이거임 (set,get)=>({})이형태
create(combine({ count: 0 }, (set, get) => 리턴객체));
```
