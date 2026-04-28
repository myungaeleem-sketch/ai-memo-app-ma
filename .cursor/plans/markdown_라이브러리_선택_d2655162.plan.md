---
name: Markdown 라이브러리 선택
overview: 메모 본문에 Markdown을 도입할 때 권장되는 npm 패키지 조합과, Context7로 최신 문서를 보조하는 방법을 정리합니다. (이 세션에서는 Context7 API를 직접 호출하지 못했습니다.)
todos:
  - id: ctx7-setup
    content: (선택) Cursor에 Context7 MCP 연결 후 프롬프트에 use context7 또는 /remarkjs/react-markdown 조회
    status: completed
  - id: deps-install
    content: npm으로 react-markdown, remark-gfm 설치 및 필요 시 @tailwindcss/typography
    status: completed
  - id: render-form-viewer
    content: MemoForm 미리보기 + MemoViewer 본문에 ReactMarkdown 적용(memo는 그대로 문자열 저장)
    status: completed
isProject: false
---

# Markdown 기능 도입 시 라이브러리 선택 (Context7 연계 안내 포함)

## Context7 사용에 대해

**Context7**은 MCP로 라이브러리별 최신 문서 스니펫을 가져오는 도구입니다. Cursor에서 [Context7 MCP](https://context7.com/docs/overview)를 설정한 뒤, 프롬프트에 `**use context7`** 또는 라이브러리 식별자(예: `/remarkjs/react-markdown`)를 넣으면, 구현 단계에서 버전에 맞는 API 예제를 안전하게 맞출 수 있습니다.

**참고**: 현재 이 에이전트 세션에는 Context7 MCP 도구가 연결되어 있지 않아, 여기서는 공개 문서·관행을 기준으로 권장안만 제시합니다. 실제 통합 전에 Cursor에서 Context7로 `react-markdown`, `remark-gfm` 최신 문서를 한 번 조회하는 것을 권장합니다.

---

## 권장 조합 (이 프로젝트에 맞춤)

메모 데이터는 `[Memo.content](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\types\memo.ts)` 문자열로 저장되고, 편집은 클라이언트 컴포넌트(`[MemoForm](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoForm.tsx)`), 조회는 `[MemoViewer](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoViewer.tsx)`·목록 카드에서 이루어집니다. **저장 형식은 Markdown 원문**, **표시만 렌더링**하는 방식이 단순하고 AGENTS의 “불필요한 의존성 확장”과도 잘 맞습니다.


| 역할                          | 패키지                                                                                 | 이유                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Markdown → React 트리 렌더링** | `[react-markdown](https://github.com/remarkjs/react-markdown)`                      | remark/rehype 파이프라인, 기본적으로 안전한 렌더링, 플러그인 확장 용이, React·Next(App Router)와 널리 함께 쓰임                                                                                                      |
| **GFM (표, 취소선, 체크리스트 등)**   | `[remark-gfm](https://github.com/remarkjs/remark-gfm)`                              | GitHub 스타일 확장을 `remarkPlugins`로 추가                                                                                                                                                    |
| **본문 타이포 스타일 (선택)**         | `[@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)` | 렌더 결과에 `prose` 클래스 적용 시 목차·코드블록 등 가독성 향상. 프로젝트는 Tailwind 4(`[globals.css](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\app\globals.css)`)이므로 설치 후 v4 방식에 맞게 플러그인 등록 필요 |


**편집 UI**: 처음에는 `**textarea` + 실시간 미리보기**(같은 폼 안에서 `react-markdown`으로 미리보기 영역만 렌더)만으로도 요구를 충족하기 쉽습니다. 툴바·WYSIWYG가 필요해지면 그때 **별도 에디터 전용 패키지**(예: `@uiw/react-md-editor`, MDXEditor 등)를 검토하는 편이 의존성을 단계적으로 관리하기 좋습니다.

**보안 참고**: 사용자가 동일 브라우저에서 자기 메모에 스크립트를 넣는 시나리오는 낮지만, 외부에서 붙여넣은 마크다운을 그대로 신뢰하지 않으려면 Context7 문서와 함께 `**rehype-sanitize`** 적용 여부를 검토할 수 있습니다.

---

## 대안 (간단 비교)

- `**marked` + `dompurify` / `isomorphic-dompurify`**: HTML 문자열 생성 후 정제·삽입. React 친화성과 트리 업데이트 측면에서는 `react-markdown`보다 손이 많이 갑니다.
- **Codemirror 6 + Markdown**: 에디터 경험은 좋으나 훨씬 무겁고, “표시”만 필요하면 과합니다.

---

## 구현 시 건드릴 파일 (참고용, 실행은 사용자 확인 후)

- `[MemoForm.tsx](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoForm.tsx)`: 내용 필드 옆/아래 미리보기, placeholder에 Markdown 안내
- `[MemoViewer.tsx](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoViewer.tsx)`: 본문을 `ReactMarkdown`으로 렌더
- `[MemoItem.tsx](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoItem.tsx)`(선택): 목록 요약은 평문처럼 보이게 하려면 짧은 문자열 자르기 또는 markdown strip 헬퍼

데이터 스키마 변경은 필수는 아닙니다(기존 `content`에 Markdown 문자열 저장).

---

## 요약

1. **필수 추천**: `react-markdown` + `remark-gfm`
2. **스타일**: `@tailwindcss/typography` + `prose` (Tailwind 4 설정 반영)
3. **편집**: 초기에는 `textarea` + 미리보기
4. **Context7**: MCP 연결 후 구현 시 `use context7`로 위 패키지 문서를 조회하면 버전별 옵션(`remarkPlugins`, `components` 커스텀 등)을 정확히 맞출 수 있음

