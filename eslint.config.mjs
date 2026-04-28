import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // react-hooks v7: 기존 폼·모달 동기화 패턴과 충돌하므로 비활성화
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default eslintConfig
