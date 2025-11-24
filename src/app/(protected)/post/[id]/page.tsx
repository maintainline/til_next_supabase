import CommentEditor from '@/components/comment/CommentEditor';
import CommentList from '@/components/comment/CommentList';
import PostItem from '@/components/post/PostItem';

// 웹브라우저용은 클라이언트 컴포넌트에서만...
// import { createClient } from '@/lib/supabase/client';

// 서버에서 실행하므로
import { createClient } from '@/lib/supabase/server';
import { Description } from '@radix-ui/react-dialog';
import { Metadata } from 'next';

import { redirect } from 'next/navigation';
import { cache } from 'react';

interface PostDetailProps {
  params: {
    id: string;
  };
}

interface PostMeta {
  id: number;
  content: string;
  created_at: string;
  image_urls: string[] | null;
  author: {
    id: string;
    nickname: string;
    avatar_url: string | null;
  };
}

const siteUrl = 'https://sns.devgr.kr';
const fallbackOgImage = `${siteUrl}/assets/logo.png`;
const fallbackAvatar = `${siteUrl}/assets/icons/default-avatar.jpg`;

const fetchPostMeta = cache(async (postId: number): Promise<PostMeta> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        content,
        created_at,
        image_urls,
        author:profiles!author_id(
          id,
          nickname,
          avatar_url
        )
      `
    )
    .eq('id', postId)
    .single();

  if (error || !data) {
    throw error ?? new Error('POST_NOT_FOUND');
  }

  return data as unknown as PostMeta;
});

function buildDescription(content: string) {
  if (!content) return '게시글 상세';
  return content.length > 120 ? `${content.slice(0, 117)}...` : content;
}

export async function generateMetadata(
  props: PostDetailProps
): Promise<Metadata> {
  const resolvedParams = await props.params;
  const postId = Number(resolvedParams.id);

  if (!resolvedParams.id || Number.isNaN(postId)) {
    return {
      title: '게시글을 찾을 수 없습니다.',
      robots: { index: false, follow: false },
    };
  }

  try {
    const post = await fetchPostMeta(postId);
    const description = buildDescription(post.content);
    const ogImage = post.image_urls?.[0] ?? fallbackOgImage;

    return {
      title: `${post.author.nickname}의 게시글`,
      description,
      alternates: { canonical: `/post/${post.id}` },
      openGraph: {
        type: 'article',
        title: `${post.author.nickname}의 게시글`,
        description,
        url: `${siteUrl}/post/${post.id}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${post.author.nickname}의 게시글 이미지`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.author.nickname}의 게시글`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: '게시글을 찾을 수 없습니다.',
      robots: { index: false, follow: false },
    };
  }
}

async function PostDetail(props: PostDetailProps) {
  const resolvedParams = await props.params;
  const { id } = await resolvedParams;

  if (!id || id.trim() === '') {
    redirect('/');
  }
  const postId = Number(id);
  const post = await fetchPostMeta(postId).catch(() => null);

  if (!post) {
    redirect('/');
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: `${post.author.nickname}의 게시글`,
    articleBody: post.content,
    datePublished: post.created_at,
    image:
      post.image_urls && post.image_urls.length > 0
        ? post.image_urls
        : [fallbackOgImage],
    mainEntityOfPage: `${siteUrl}/post/${post.id}`,
    author: {
      '@type': 'Person',
      name: post.author.nickname,
      url: `${siteUrl}/profile/${post.author.id}`,
      image: post.author.avatar_url ?? fallbackAvatar,
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className='flex flex-col gap-5'>
        <PostItem postId={Number(id)} type={'DETAIL'} />
        <div className='text-xl font-bold'>댓글</div>
        <CommentEditor type='CREATE' postId={Number(id)} />
        <CommentList postId={Number(id)} />
      </div>
    </>
  );
}

export default PostDetail;
