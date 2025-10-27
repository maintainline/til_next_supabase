import { Database } from '@/types/database.types';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient<Database>(supabaseUrl!, supabaseKey!);

// 외부 클라이언트 컴포넌트에서 자유롭게 사용하도록 설정
const supabase = createClient();
export default supabase;
