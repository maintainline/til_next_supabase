import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  isOpen: false,
};

const useProfileEditorModalStore = create(
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
    { name: 'profileEditorModalStore' }
  )
);

// 사용하기 좋도록 별도 hook 으로 뽑기
export const useOpenProfileEditorModal = () => {
  const open = useProfileEditorModalStore(store => store.actions.open);
  return open;
};

// 전체 내보내기
export const useProfileEditor = () => {
  const store = useProfileEditorModalStore();
  return store;
};
