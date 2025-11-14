import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};

type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type State = CloseState | OpenState;
const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          // 아래코드는 필요한 값은 받고, isOpen 은 무조건 true 셋팅
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'AlertModalStore' }
  )
);

export const useOpenAlertModal = () => {
  const open = useAlertModalStore(store => store.actions.open);
  return open;
};

export const useAlertModal = () => {
  const store = useAlertModalStore();
  // 아래는 우리가 원하는 타입을 추가해서 리턴하기 위한 처리
  // & 는 intersection 으로 타입을 합친다는 의미
  return store as typeof store & State;
};
