import { listPublicPosts, listPublicProfiles } from '@/lib/sitemap';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, posts] = await Promise.all([
    listPublicProfiles(),
    listPublicPosts(),
  ]);

  return [
    { url: 'https://sns.devgr.kr/', changeFrequency: 'daily', priority: 1 },
    ...profiles.map(profile => ({
      url: `https://sns.devgr.kr/profile/${profile.id}`,
      lastModified: profile.created_at ?? undefined,
    })),
    ...posts.map(post => ({
      url: `https://sns.devgr.kr/post/${post.id}`,
      lastModified: post.created_at ?? undefined,
    })),
  ];
}
