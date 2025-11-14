import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

//  새 포스트 등록 타입
type CreateMode = {
  isOpen: true;
  type: 'CREATE';
};
// 포스트 편집 타입
type EditMode = {
  isOpen: true;
  type: 'EDIT';
  // 초기 설정값의 타입
  postId: number;
  content: string;
  imageUrls: string[] | null;
};
// 모달이 Open인 경우 타입
type OpenState = CreateMode | EditMode;
// 모달이 Close인 경우 타입
type CloseState = {
  isOpen: false;
};
type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

// 단계가 중요함.
// 미들웨어와 겹침을 주의하자.
// Store 는 state 와 action 이 있다.
const usePostEditorStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        openCreate: () => {
          set({ isOpen: true, type: 'CREATE' });
        },
        openEdit: (params: Omit<EditMode, 'isOpen' | 'type'>) => {
          // 코드 보시기 좋으시라고.
          set({ isOpen: true, type: 'EDIT', ...params });
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
export const useOpenCreatePostModal = () => {
  const openCreate = usePostEditorStore(store => store.actions.openCreate);
  return openCreate;
};
export const useOpenEditPostModal = () => {
  const openEdit = usePostEditorStore(store => store.actions.openEdit);
  return openEdit;
};

// 미리 store 전체 내보내기
export const usePostEdiotorModal = () => {
  const store = usePostEditorStore();
  return store as typeof store & State;
};
