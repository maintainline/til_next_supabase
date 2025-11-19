import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[{
      protocol:'https',
      hostname:'dysxoosoenvdwrohanfv.supabase.co',
       // 아래는 생략이 가능합니다.
      pathname:'/storage/v1/object/public/**'
    }]
  }
};

export default nextConfig;
