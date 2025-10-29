# Zustand 리뷰

## 1. 리액트 상태(state)에 대한 이해

### 1.1. 컴포넌트 상태(로컬)

- useState
- State Drilling : 컴포넌트에 props로 state 를 전달함. 반복됨.

### 1.2. 앱 전역 상태(글로벌)

- Context API
- Context API 를 응용한 라이브러리 : Redux, Recoil, `Zustand`, Mobx, Joitai...

### 1.3. 네트워크 상태

- 개발자가 직접 관리함(fetch, axios)
- 라이브러리 React Query

## 2. Zustand

- 레퍼런스많고, 용량 작고, 배우기 쉽고, 설정도 `create` 로 정리됨
- `npm install zustand`

## 3. 기본 사용법

- `/src/app/counter 폴더` 생성
- `/src/app/counter/page.tsx 파일` 생성

```tsx
function CounterPage() {
  return (
    <div>
      <h1 className='text-2xl font-bold'>Counter</h1>
    </div>
  );
}

export default CounterPage;
```

### 3.1. 전역 stores 생성하기

- `/src/stores 폴더` 생성
- `/src/stores/Count.ts 파일` 생성

### 3.2. 단계별 store 생성

- 단계 1

```ts
import { create } from 'zustand';
 create(콜백함수 한개);
```

- 단계 2

```ts
import { create } from 'zustand';
create(() => {});
```

- 단계 3 : 객체(store) 한개를 리턴함

```ts
import { create } from 'zustand';
create(() => {
    return 전역변수 store 객체
});
```

- 단계 4 : 객체(store) 한개를 리턴함

```ts
import { create } from 'zustand';
create(() => {
  return {};
});
```

- 단계 5 : store 객체에는 state 와 action 키

```ts
import { create } from 'zustand';
create(() => {
  return {
    state: 초기값,
    action: state 변경하는 함수
  };
});
```

- 단계 6 : count 만들고, action 정의하기

```ts
import { create } from 'zustand';
create(() => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {},
    decrement: () => {},
  };
});
```

- 단계 7 : create 함수에는 set 매개변수가 있다.
- set 은 state 즉, count 를 값을 설정하는 기능

```ts
import { create } from 'zustand';
create(set => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {},
    decrement: () => {},
  };
});
```

- 단계 8 : create 함수에는 get 매개변수가 있다.
- get 은 state 즉, count 를 값을 읽는 기능

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {},
    decrement: () => {},
  };
});
```

- 단계 9 : get 활용하기

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {
      // get 은 store 의 객체를 반환함
      get().count;
    },
    decrement: () => {},
  };
});
```

- 단계 10 : set 활용하기

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {
      // get 은 store 의 객체를 반환함
      const count = get().count;
      // set (객체)
      set({ count: count + 1 });
    },
    decrement: () => {},
  };
});
```

- 단계 11 : set ? 이상하다.
- `set({...state, count:count + 1});`
- zustand 는 객체 내부의 state 의 키명을 기준으로 명시만 하면됨
- 키명을 명시하고 새로운 값만 작성해 주면됨
- State 객체를 ... 즉, spred 할 필요없음.

- 단계 12 : set사용시 함수형태도 지원한다.

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {
      // get 은 store 의 객체를 반환함
      const count = get().count;
      // set (객체)
      set({ count: count + 1 });
      // 함수형태 지원
      set(() => {
        return {};
      });
    },
    decrement: () => {},
  };
});
```

- 단계 13 : set사용시 함수형태도 지원한다.

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    //state :  초기값
    count: 0,
    //action :  state 변경
    increment: () => {
      // get 은 store 의 객체를 반환함
      const count = get().count;
      // set (객체)
      set({ count: count + 1 });
      // 함수형태 지원
      set(store => {
        return { count: store.count };
      });
    },
    decrement: () => {},
  };
});
```

- 단계 14 : 보통 get 은 사용하지 않는다

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    // state : 초기값
    count: 0,
    // action : state 변경
    increment: () => {
      // 함수형태 지원
      set(store => {
        return { count: store.count };
      });
    },
    decrement: () => {},
  };
});
```

- 단계 15 : 화살표 함수 줄이기

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    // state : 초기값
    count: 0,
    // action : state 변경
    increment: () => {
      // 함수형태 지원
      set(store => ({ count: store.count }));
    },
    decrement: () => {},
  };
});
```

- 단계 16 : 추가 구현

```ts
import { create } from 'zustand';
create((set, get) => {
  return {
    // state : 초기값
    count: 0,
    // action : state 변경
    increment: () => {
      // 함수형태 지원
      set(store => ({ count: store.count + 1 }));
    },
    decrement: () => {
      set(store => ({ count: store.count - 1 }));
    },
  };
});
```

- 단계 17 : 타입 추가

```ts
import { create } from 'zustand';

type CountStoreType = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

create<CountStoreType>((set, get) => {
  return {
    // state : 초기값
    count: 0,
    // action : state 변경
    increment: () => {
      // 함수형태 지원
      set(store => ({ count: store.count + 1 }));
    },
    decrement: () => {
      set(store => ({ count: store.count - 1 }));
    },
  };
});
```

- 단계 18 : create 함수는 커스텀 훅을 즉시 리턴함

```ts
import { create } from 'zustand';

type CountStoreType = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

// 커스텀 훅을 리턴해 준다. 아주좋음~
export const useCountStore = create<CountStoreType>((set, get) => {
  return {
    // state : 초기값
    count: 0,
    // action : state 변경
    increment: () => {
      // 함수형태 지원
      set(store => ({ count: store.count + 1 }));
    },
    decrement: () => {
      set(store => ({ count: store.count - 1 }));
    },
  };
});
```

## 4. 기본 활용하기

- `/src/app/counter/page.tsx`

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useCountStore } from '@/stores/Count';

function CounterPage() {
  const { count, increment, decrement } = useCountStore();
  return (
    <div>
      <h1 className='text-2xl font-bold'>Counter</h1>
      <p className='text-4xl font-bold'>{count}</p>
      <Button onClick={decrement}>Decrement</Button>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
}

export default CounterPage;
```

## 5. 역할별로 파일 분리하기

### 5.1. 컴포넌트로 분리하기

- `/src/components/counter 폴더` 생성
- `/src/components/counter/Viewer.tsx` 파일 생성

```tsx
'use client';
import { useCountStore } from '@/stores/Count';

const Viewer = () => {
  const { count } = useCountStore();
  return <div className='text-4xl font-bold'>{count}</div>;
};

export default Viewer;
```

- `/src/components/counter/Controller.tsx` 파일 생성

```tsx
'use client';
import { useCountStore } from '@/stores/Count';
import React from 'react';
import { Button } from '../ui/button';

const Controller = () => {
  const { decrement, increment } = useCountStore();
  return (
    <div>
      <Button onClick={decrement}>Decrement</Button>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
};

export default Controller;
```

### 5.2. page 출력하기

- `/src/app/counter/page.tsx`

```tsx
import Controller from '@/components/counter/Controller';
import Viewer from '@/components/counter/Viewer';

function CounterPage() {
  return (
    <div>
      <h1 className='text-2xl font-bold'>Counter</h1>
      <Viewer />
      <Controller />
    </div>
  );
}

export default CounterPage;
```

## 6. 컴포넌트의 리랜더링 상태 파악하기

### 6.1. 웹 브라우저의 Devtools 를 설치함.

- https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=ko&pli=1
- 설치후 > 웹브라우저 F12 > Components 탭 > Setting(톱니모양) > Highlight updates when components render 활성

### 6.2. 왜 불필요한 리 랜더링이 일어나는가?

- 버튼은 리랜더링이 필요 없는데 일어나는 이유?
- 아래 구문은 count 즉, state 없지만, usehook 이 전체 store 를 반환하므로 리랜더링이 일어난다.

```tsx
const { decrement, increment } = useCountStore();
```

### 6.3. 해당 문제 해결하기(간단함)

- 어떤 값을 가져올지 정확히 명시한 훅을 생성하면 끝.
- 어떤 값을 가져올지 정확히 명시한 훅함수를 `Selector 함수` 라고함.

```tsx
'use client';
import { useCountStore } from '@/stores/Count';
import React from 'react';
import { Button } from '../ui/button';

const Controller = () => {
  // selector 함수 활용
  const increment = useCountStore(store => store.increment);
  const decrement = useCountStore(store => store.decrement);

  return (
    <div>
      <Button onClick={decrement}>Decrement</Button>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
};

export default Controller;
```

```tsx
'use client';
import { useCountStore } from '@/stores/Count';

const Viewer = () => {
  //seletor 함수
  const count = useCountStore(store => store.count);
  return <div className='text-4xl font-bold'>{count}</div>;
};

export default Viewer;
```

## 7. Store 의 구조가 불명확하다.

- state 와 action 의 조합이 store 이다.
- `actions 키` 를 별도로 명시함.

```ts
import { create } from 'zustand';

type CountStoreType = {
  count: number;
  actions: {
    increment: () => void;
    decrement: () => void;
  };
};

// 커스텀 훅을 리턴해 준다. 아주좋음~
export const useCountStore = create<CountStoreType>((set, get) => {
  return {
    count: 0,
    actions: {
      increment: () => {
        // 함수형태 지원
        set(store => ({ count: store.count + 1 }));
      },
      decrement: () => {
        set(store => ({ count: store.count - 1 }));
      },
    },
  };
});
```

- Controlloer.tsx

```tsx
'use client';
import { useCountStore } from '@/stores/Count';
import React from 'react';
import { Button } from '../ui/button';

const Controller = () => {
  // selector 함수 활용
  const { increment, decrement } = useCountStore(store => store.actions);

  return (
    <div>
      <Button onClick={decrement}>Decrement</Button>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
};

export default Controller;
```

## 8. store 의 state 또는 action 단어가 바뀌면 모두 뜯어 고쳐야한다...

- 복잡한 프로젝트는 Select 함수를 컴포넌트에서 직접 불러서 활용하는 경우 드물다.

### 8.1. 전용 커스텀 훅으로 생성 후 활용함.(간단함)

- Count.ts 전용 훅들 생성.

```ts
import { create } from 'zustand';

type CountStoreType = {
  count: number;
  actions: {
    increment: () => void;
    decrement: () => void;
  };
};

// 커스텀 훅을 리턴해 준다. 아주좋음~
export const useCountStore = create<CountStoreType>((set, get) => {
  return {
    count: 0,
    actions: {
      increment: () => {
        // 함수형태 지원
        set(store => ({ count: store.count + 1 }));
      },
      decrement: () => {
        set(store => ({ count: store.count - 1 }));
      },
    },
  };
});

// 전용 훅들
export const useCount = () => {
  const count = useCountStore(store => store.count);
  return count;
};
export const useIncrement = () => {
  const increment = useCountStore(store => store.actions.increment);
  return increment;
};
export const useDecrement = () => {
  const decrement = useCountStore(store => store.actions.decrement);
  return decrement;
};
```

- Controller.tsx 적용하기

```tsx
'use client';
import { useDecrement, useIncrement } from '@/stores/Count';
import { Button } from '../ui/button';

const Controller = () => {
  // selector 함수 활용
  const increment = useIncrement();
  const decrement = useDecrement();

  return (
    <div>
      <Button onClick={decrement}>Decrement</Button>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
};

export default Controller;
```

- Viewer.tsx 적용하기

```tsx
'use client';
import { useCount } from '@/stores/Count';

const Viewer = () => {
  //seletor 함수
  const count = useCount();
  return <div className='text-4xl font-bold'>{count}</div>;
};

export default Viewer;
```
