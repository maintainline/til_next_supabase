import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Prettier 플러그인 추가
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      prettier: eslintPluginPrettier, //  Prettier 플러그인 추가
    },
    rules: {
      ...eslintConfigPrettier.rules, //  Prettier와 충돌하는 ESLint 규칙 비활성화
      "prettier/prettier": ["warn", { endOfLine: "auto" }], //  Prettier 스타일을 강제 적용 (오류 발생 시 ESLint에서 표시)
      "@typescript-eslint/no-unused-vars": "warn", //  기존 TypeScript 규칙 유지
      "@typescript-eslint/no-explicit-any": "off", //  any 타입 사용 허용
    },
  },
];

export default eslintConfig;