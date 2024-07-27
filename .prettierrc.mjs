/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  useTabs: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  singleQuote: true,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  // 화살표 함수에서 파라미터에 괄호 반드시 사용
  arrowParens: 'always',

  /* 마크업 형태에서 여러 줄 일 경우, 닫는 꺽쇠를 줄넘김 처리한다
   <div
     className="style"
   > // 이부분!
     Contents here
  </div> */
  bracketSameLine: false,
  singleAttributePerLine: true,
};

export default config;
