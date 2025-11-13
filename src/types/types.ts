import { type Database } from './database.types';
// 포스트 관련
export type PostEntity = Database['public']['Tables']['posts']['Row'];
export type InsertPostEntity = Database['public']['Tables']['posts']['Insert'];
export type UpdatePostEntity = Database['public']['Tables']['posts']['Update'];
export type PostTableEntity = Database['public']['Tables']['posts'];
// 프로필 관련
export type ProfileEntity = Database['public']['Tables']['profiles']['Row'];
export type InsertProfileEntity =
  Database['public']['Tables']['profiles']['Insert'];
export type UpdateProfileEntity =
  Database['public']['Tables']['profiles']['Update'];
export type ProfileTableEntity = Database['public']['Tables']['profiles'];

// 포스트와 프로필 타입 조합
export type Post = PostEntity & { author: ProfileEntity };

export type UseMutationCallback = {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
