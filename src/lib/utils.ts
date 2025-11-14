import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui 설치하면 생성됨 (클래스명 합쳐주는 유틸함수)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 랜덤하면서 중복되지 않는 닉네임 생성
export const getRandomNickName = () => {
  const randomResult = Math.random().toString(36).substring(2, 8);
  return `user_nickname_${randomResult}`;
};
