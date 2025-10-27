import { type Database } from './database.types';

export type PostEntity = Database['public']['Tables']['posts']['Row'];
export type InsertPostEntity = Database['public']['Tables']['posts']['Insert'];
export type UpdatePostEntity = Database['public']['Tables']['posts']['Update'];
export type PostTableEntity = Database['public']['Tables']['posts'];
