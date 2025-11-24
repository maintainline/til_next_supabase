import { createClient } from '@/lib/supabase/server';

interface SitemapProfile {
  id: string;
  created_at: string | null;
}

interface SitemapPost {
  id: number;
  created_at: string | null;
}

export async function listPublicProfiles(): Promise<SitemapProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function listPublicPosts(): Promise<SitemapPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data;
}
