import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { error: deleteProfileError } = await admin
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteProfileError && deleteProfileError.code !== 'PGRST116') {
      console.error(deleteProfileError);
      return NextResponse.json(
        { message: '프로필 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      console.error(deleteUserError);
      return NextResponse.json(
        { message: '회원 탈퇴 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
