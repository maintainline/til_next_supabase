# Next.js 프로젝트 환경 설정

## 1. 프로젝트 생성

```bash
npx create-next-app@latest .
```

## 2. 프로젝트 생성 옵션

```bash
√ Which linter would you like to use? » ESLint
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like your code inside a `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to use Turbopack? (recommended) ... No
√ Would you like to customize the import alias (`@/*` by default)? ... Yes
√ What import alias would you like configured? ... @/*
```

## 3. Tailwind 환경 설정

- package.json 에서 `tailwind 버전` 확인
- 아래 처럼 버전이 최신 `4.x` 버전 확인

```json
 "tailwindcss": "^4",
```

### 3.1. `postcss.config.mjs` 설정 확인

```mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
};

export default config;
```

### 3.2. `tailwind.config.ts` 파일 생성

- Tailwind 경로 및 Theme 설정, Plugin 추가, Dark Mode, CSS 변수 연결

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // 1. 컨텐츠 경로: Tailwind가 클래스를 찾을 파일 경로
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 2. 커스텀 색상: CSS 변수와 연결된 색상 정의
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      // 3. 커스텀 폰트: 프로젝트에서 사용할 폰트 패밀리 정의
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  // 4. 플러그인: 추가 기능을 위한 플러그인 배열
  plugins: [],
};

export default config;
```

- `tailwind.config.ts` 내용 추가

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 다크 모드 설정
  theme: {
    extend: {
      // 브랜드 색상 시스템
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // 기본 primary 색상
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // 상태 색상
        success: {
          /* 녹색 계열 */
        },
        warning: {
          /* 노란색 계열 */
        },
        error: {
          /* 빨간색 계열 */
        },
      },

      // 타이포그래피 시스템
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        // ... 더 많은 크기
      },

      // 애니메이션 시스템
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
```

- 참고 예

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Linguavibe Brand Colors
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Main color
          600: '#0284c7', // Hover color
          700: '#0369a1',
        },
        teal: {
          300: '#5eead4',
          400: '#2dd4bf', // Accent color (vibed)
          500: '#14b8a6', // Accent hover
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e7eb', // Border / line
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280', // Sub text
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937', // Main text
          900: '#111827',
        },
        stone: {
          50: '#fafaf9', // Neutral background
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem', // rounded-xl
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm (subtle)
        DEFAULT:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      maxWidth: {
        '2xl': '42rem', // Content width
      },
      spacing: {
        18: '4.5rem',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }], // Body text
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3.3. global.css 설정

- Next.js 의 모든 컴포넌트들이 참조하는 글로벌 css
- `/src/app/global.css` 업데이트
- 반드시 `@import 는 css 첫줄`이여야 함.
- tailwind 4.x 버전이므로 `@import "tailwindcss";`

```css
@import 'tailwindcss';

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* 다크 모드 설정 */
.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}

/* 시스템 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* 기본 스타일 */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background);
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

/* 포커스 스타일 */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 선택 텍스트 스타일 */
::selection {
  background-color: #3b82f6;
  color: white;
}
```

## 4. Prettier 설정

- Prettier 는 코드 포맷터로, 일관된 코드 스타일을 자동으로 유지함.

### 4.1. 설치

- `Prettier - Code formatter 설치` 확장프로그램 필요

```bash
npm install --save-dev prettier
```

### 4.2. `/.prettierrc 파일` 생성

- 포멧팅 규칙 정의 설정

```json
{
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "htmlWhitespaceSensitivity": "css",
  "jsxSingleQuote": true,
  "proseWrap": "preserve",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

### 4.3. 위 내용의 설명

- `semi`: 세미콜론 사용 (true: ;, false: 없음)
- `singleQuote`: 작은따옴표 사용 (true: ', false: ")
- `quoteProps`: 객체 속성에 따옴표 사용 ("as-needed": 필요시만, "consistent": 일관성, "preserve": 보존)
- `trailingComma`: 후행 쉼표 사용 ("none": 없음, "es5": ES5에서 허용되는 곳, "all": 모든 곳)
- `tabWidth`: 탭 너비 (공백 수)
- `useTabs`: 탭 대신 공백 사용 (false: 공백, true: 탭)
- `printWidth`: 한 줄 최대 길이 (문자 수)
- `endOfLine`: 줄 끝 문자 ("lf": \n, "crlf": \r\n, "cr": \r, "auto": 자동)
- `bracketSpacing`: 객체 리터럴 괄호 내부 공백 (true: { foo }, false: {foo})
- `bracketSameLine`: JSX 닫는 괄호를 같은 줄에 (false: 새 줄, true: 같은 줄)
- `arrowParens`: 화살표 함수 매개변수 괄호 ("avoid": 단일 매개변수 시 생략, "always": 항상 사용)
- `htmlWhitespaceSensitivity`: HTML 공백 민감도 ("css": CSS display 속성 기준, "strict": 엄격, "ignore": 무시)
- `jsxSingleQuote`: JSX에서 작은따옴표 사용 (true: ', false: ")
- `proseWrap`: 마크다운 텍스트 줄바꿈 ("always": 항상, "never": 절대, "preserve": 보존)
- `embeddedLanguageFormatting`: 임베디드 언어 포맷팅 ("auto": 자동, "off": 비활성화)
- `singleAttributePerLine`: JSX 속성을 한 줄에 하나씩 (false: 여러 속성 허용, true: 한 줄에 하나)

### 4.4. `/.prettierignore 파일` 생성

- 포멧팅에서 제외할 파일들을 명시함.

```txt
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
.next/
out/
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Generated files
*.min.js
*.min.css
*.bundle.js
*.bundle.css

# Documentation
CHANGELOG.md
LICENSE
# README.md

# Config files that should not be formatted
*.config.js
*.config.mjs
*.config.ts
```

### 4.5. 명령어로 포멧팅을 한번에 실행하도록 스크립트 작성(선택)

- `package.json` 에 Script 추가

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write --ignore-unknown"
  }
```

### 4.6. 스크립트 실행 예제

```txt
# 전체 프로젝트 포맷팅
npm run format

# 포맷팅 체크 (변경사항 없이 확인만)
npm run format:check

# 특정 파일만 포맷팅
npx prettier --write src/app/page.tsx

# 특정 디렉토리만 포맷팅
npx prettier --write src/components/

# 포맷팅 결과 미리보기 (실제 변경하지 않음)
npx prettier --check src/app/page.tsx
```

## 5. ESLint 설정

- 코드 품질 검사 도구

### 5.1. `eslint.config.mjs` 설정

- rules(검사 규칙) 추가

```mjs
rules: {
    "@typescript-eslint/no-explicit-any": "off",  // any 타입 허용
  }
```

- 자세한 옵션을 포함한예제

```mjs
// Node.js 내장 모듈에서 dirname 함수를 가져옴 (파일 경로의 디렉토리명 추출용)
import { dirname } from 'path';

// Node.js 내장 모듈에서 fileURLToPath 함수를 가져옴 (URL을 파일 경로로 변환)
import { fileURLToPath } from 'url';

// ESLint의 FlatCompat 클래스를 가져옴 (기존 설정 형식을 새로운 flat config 형식으로 변환)
import { FlatCompat } from '@eslint/eslintrc';

// 현재 파일의 URL을 파일 경로로 변환 (ES 모듈에서 __filename 대체)
const __filename = fileURLToPath(import.meta.url);

// 현재 파일이 위치한 디렉토리 경로를 추출 (ES 모듈에서 __dirname 대체)
const __dirname = dirname(__filename);

// FlatCompat 인스턴스를 생성하여 기존 ESLint 설정을 새로운 형식으로 변환할 수 있게 함
const compat = new FlatCompat({
  baseDirectory: __dirname, // 기준 디렉토리를 현재 프로젝트 루트로 설정
});

// ESLint 설정 배열 정의 (flat config 형식)
const eslintConfig = [
  // Next.js의 기본 ESLint 규칙들을 확장 (성능, 접근성, TypeScript 관련 규칙 포함)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // 전역 설정: ESLint가 검사하지 않을 파일/디렉토리 지정
  {
    ignores: [
      'node_modules/**', // npm 패키지들이 설치된 디렉토리 (외부 라이브러리)
      '.next/**', // Next.js 빌드 결과물 디렉토리
      'out/**', // Next.js 정적 내보내기 결과물 디렉토리
      'build/**', // 일반적인 빌드 결과물 디렉토리
      'next-env.d.ts', // Next.js TypeScript 환경 정의 파일 (자동 생성)
    ],
  },

  // 파일별 규칙 설정: 특정 파일 확장자에 적용할 규칙들
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // JavaScript, JSX, TypeScript, TSX 파일에 적용
    rules: {
      // ===== Tailwind CSS 관련 규칙 =====
      'tailwindcss/classnames-order': 'warn', // Tailwind 클래스 순서를 일관되게 정렬 (경고)
      'tailwindcss/no-custom-classname': 'warn', // 정의되지 않은 커스텀 클래스 사용 시 경고
      'tailwindcss/no-contradicting-classname': 'error', // 상충하는 클래스 사용 시 오류 (예: hidden block)

      // ===== React 관련 규칙 =====
      'react/jsx-key': 'error', // 배열 렌더링 시 각 요소에 고유한 key prop 필수 (오류)
      'react/no-unescaped-entities': 'off', // HTML 엔티티(&, <, > 등) 직접 사용 허용 (비활성화)
      'react/display-name': 'off', // 함수형 컴포넌트의 displayName 설정 필수 해제 (비활성화)

      // ===== 일반적인 JavaScript/TypeScript 규칙 =====
      'prefer-const': 'error', // 재할당되지 않는 변수는 const 사용 강제 (오류)
      'no-unused-vars': 'off', // 기본 unused variables 규칙 비활성화 (TypeScript 버전 사용)
      '@typescript-eslint/no-unused-vars': [
        // TypeScript용 사용되지 않는 변수 감지 규칙
        'error', // 오류 레벨로 설정
        { argsIgnorePattern: '^_' }, // _로 시작하는 매개변수는 사용하지 않아도 허용
      ],
      '@typescript-eslint/no-explicit-any': 'off', // any 타입 사용 허용 (타입 안전성 규칙 비활성화)

      // ===== Import 관련 규칙 =====
      'import/order': [
        // import 문의 순서와 그룹화 규칙
        'error', // 오류 레벨로 설정
        {
          groups: [
            // import 그룹 순서 정의
            'builtin', // 1순위: Node.js 내장 모듈 (fs, path 등)
            'external', // 2순위: npm 패키지 (react, next 등)
            'internal', // 3순위: 프로젝트 내부 모듈 (@/components 등)
            'parent', // 4순위: 상위 디렉토리 모듈 (../utils 등)
            'sibling', // 5순위: 같은 디렉토리 모듈 (./config 등)
            'index', // 6순위: index 파일 (./index 등)
          ],
          'newlines-between': 'always', // 각 그룹 사이에 빈 줄 필수
          alphabetize: {
            // 그룹 내에서 알파벳 순 정렬
            order: 'asc', // 오름차순 정렬 (a-z)
            caseInsensitive: true, // 대소문자 구분 없이 정렬
          },
        },
      ],
    },
  },
];

// ESLint 설정을 기본 내보내기로 설정
export default eslintConfig;
```

### 5.2. Prettier 와 ESLint 통합 설정

- ESLint 와 Prettier 충돌 하지 않도록 설정

```bash
npm install --save-dev eslint-config-prettier
```

```bash
npm install --save-dev eslint-plugin-prettier
```

- `eslint.config.mjs` 에 prettier 설정 추가

```mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// Prettier 플러그인 추가
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    plugins: {
      prettier: eslintPluginPrettier, //  Prettier 플러그인 추가
    },
    rules: {
      ...eslintConfigPrettier.rules, //  Prettier와 충돌하는 ESLint 규칙 비활성화
      'prettier/prettier': ['warn', { endOfLine: 'auto' }], //  Prettier 스타일을 강제 적용 (오류 발생 시 ESLint에서 표시)
      '@typescript-eslint/no-unused-vars': 'warn', //  기존 TypeScript 규칙 유지
      '@typescript-eslint/no-explicit-any': 'off', //  any 타입 사용 허용
    },
  },
];

export default eslintConfig;
```

## 6. VSCode 설정 관리

- `/.vscode 폴더 ` 생성
- `/.vscode/settings.json 파일 `생성

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 6.1. 아래는 참조 내용

```json
{
  // ===== 기본 에디터 설정 =====
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.rulers": [80, 120],
  "editor.wordWrap": "on",
  "editor.bracketPairColorization.enabled": true,

  // ===== 파일 관련 설정 =====
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.eol": "\n",
  "files.encoding": "utf8",

  // ===== ESLint 설정 =====
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": true,

  // ===== Prettier 설정 =====
  "prettier.enable": true,
  "prettier.requireConfig": true,

  // ===== 언어별 포맷터 설정 =====
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 6.2. 아래는 참조 설명

- **`editor.formatOnSave`**: 저장 시 자동 포맷팅
- **`editor.codeActionsOnSave`**: 저장 시 ESLint 자동 수정 및 import 정리
- **`files.autoSave`**: 포커스 변경 시 자동 저장
- **`files.trimTrailingWhitespace`**: 줄 끝 공백 자동 제거
- **`files.insertFinalNewline`**: 파일 끝에 빈 줄 자동 삽입
- **`eslint.validate`**: ESLint가 검사할 파일 형식 지정

### 6.3. 확장 프로그램 설정

- `/.vscode/extension.json` 확장 프로그램 정의 내용 작성

```json
{
  "recommendations": [
    // ===== 필수 확장 프로그램 =====
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",

    // ===== Next.js 및 React 개발 =====
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "christian-kohler.npm-intellisense",

    // ===== Git 관련 =====
    "eamodio.gitlens",
    "mhutchie.git-graph",

    // ===== 개발 생산성 =====
    "redhat.vscode-yaml",
    "yzhang.markdown-all-in-one",

    // ===== 테마 및 아이콘 =====
    "pkief.material-icon-theme",
    "github.github-vscode-theme"
  ],
  "unwantedRecommendations": ["hookyqr.beautify"]
}
```

### 6.4. VSCode Config 설정.

- 에디터에 일관성을 유지하는 내용 작성 파일
- `/.editorconfig 파일`

```txt
# 최상위 EditorConfig 파일
root = true

# 모든 파일에 대한 기본 설정
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

# JavaScript/TypeScript 파일 설정
[*.{js,jsx,ts,tsx}]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

# JSON 파일 설정
[*.json]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

# CSS/SCSS 파일 설정
[*.{css,scss,sass,less}]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

# Markdown 파일 설정
[*.md]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = false
insert_final_newline = true
```

## 7. Git 설정

### 7.1. remote 연결

```bash
git remote add origin 깃허브 주소
```

### 7.2. 현재 깃 상태

```bash
git status
```

### 7.3. 현재 깃 사용자 정보 확인 및 수정

```bash
git config --global user.name
git config --global user.email
```

```bash
git config --global user.name '아이디'
git config --global user.email '이메일'
```
