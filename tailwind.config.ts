import type { Config } from "tailwindcss";

const config: Config = {
  // 1. 컨텐츠 경로: Tailwind가 클래스를 찾을 파일 경로
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 2. 커스텀 색상: CSS 변수와 연결된 색상 정의
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // 3. 커스텀 폰트: 프로젝트에서 사용할 폰트 패밀리 정의
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  // 4. 플러그인: 추가 기능을 위한 플러그인 배열
  plugins: [],
};

export default config;
