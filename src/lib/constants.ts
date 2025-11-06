// 쿼리키 팩토링 상수
export const QUERY_KEYS = {
  todo: {
    all: ['todos'],
    list: ['todos', 'list'],
    detail: (id: string) => ['todos', 'detail', id],
  },
};
