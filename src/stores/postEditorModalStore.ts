import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  isOpen: false,
};

// 단계가 중요함.
// 미들웨어와 겹침을 주의하자.
// Store 는 state 와 action 이 있다.
const usePostEditorStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: () => {
          set({ isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'PostEditorStore' }
  )
);

// 오로지 store 의 acitons 의  open 만 가져감
export const useOpenPostEditorModal = () => {
  const open = usePostEditorStore(store => store.actions.open);
  return open;
};
// 미리 store 전체 내보기니
export const usePostEdiotorModal = () => {
  const {
    isOpen,
    actions: { open, close },
  } = usePostEditorStore();
  return { isOpen, open, close };
};
