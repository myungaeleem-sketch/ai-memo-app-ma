---
name: Gemini 메모 요약
overview: 메모 상세보기 모달에서 현재 메모 내용을 Google Gemini SDK로 요약하는 기능을 추가합니다. API 키는 서버 API route에서만 사용하고, 클라이언트는 `/api/memos/summary`를 호출합니다.
todos:
  - id: install-genai
    content: "@google/genai 패키지 설치 및 .env.example 생성"
    status: completed
  - id: add-summary-api
    content: Gemini SDK를 사용하는 /api/memos/summary Route Handler 추가
    status: completed
  - id: add-summary-ui
    content: MemoViewer에 AI 요약 버튼, 로딩/오류/결과 UI 추가
    status: completed
  - id: verify-summary
    content: lint/build로 타입 및 빌드 검증
    status: completed
isProject: false
---

# Gemini 메모 요약 기능 구현 계획

## 조사 결과

Context7의 `/googleapis/js-genai` 문서 기준으로 npm 패키지는 `@google/genai`이며, `GoogleGenAI` 인스턴스의 `ai.models.generateContent()`로 텍스트 생성이 가능합니다. 사용자 요구 모델은 `gemini-2.5-flash-lite`로 고정합니다.

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-lite',
  contents: '요약할 메모 본문',
})
```

API 키는 브라우저 번들에 노출되면 안 되므로, 클라이언트 컴포넌트인 `[src/components/MemoViewer.tsx](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoViewer.tsx)`에서 SDK를 직접 호출하지 않고 Next.js 서버 Route Handler를 둡니다.

## 구현 방향

### 1. 패키지 및 환경 변수

- `@google/genai` 설치
- 루트에 `[.env.example](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\.env.example)` 생성
- 환경 변수명은 `GEMINI_API_KEY` 사용

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### 2. 서버 API Route 추가

**파일**: `[src/app/api/memos/summary/route.ts](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\app\api\memos\summary\route.ts)`

- `POST` 요청만 지원
- 요청 body: `{ title: string; content: string }`
- `content` 빈 값 검증
- `process.env.GEMINI_API_KEY` 누락 시 500 응답
- `@google/genai`로 `gemini-2.5-flash-lite` 호출
- 한국어 요약을 반환하도록 `systemInstruction` 설정
- 응답 body: `{ summary: string }`
- 실패 시 `{ error: string }` 반환

요약 프롬프트는 다음처럼 제한합니다.

```text
다음 메모를 한국어로 3줄 이내로 요약하세요.
핵심 행동 항목이 있으면 마지막 줄에 포함하세요.
```

### 3. 상세보기 모달에 요약 UI 추가

**파일**: `[src/components/MemoViewer.tsx](c:\Users\masocampus\Desktop\memo-app-base\memo-app-base\src\components\MemoViewer.tsx)`

현재 본문 렌더링 위치:

```typescript
<div className="mb-6">
  <h3 className="sr-only">내용</h3>
  <MemoMarkdown>{memo.content}</MemoMarkdown>
</div>
```

변경 사항:

- `useState`로 `summary`, `summaryLoading`, `summaryError` 관리
- 모달이 다른 메모로 바뀔 때 기존 요약 상태 초기화
- “AI 요약” 버튼 추가
- 클릭 시 `/api/memos/summary`로 `title`, `content` 전송
- 로딩 중 버튼 비활성화 및 “요약 중...” 표시
- 성공 시 본문 위 또는 아래에 요약 박스 표시
- 오류 시 한국어 에러 메시지 표시

### 4. 검증

- `npm run lint`
- `npm run build`
- 수동 확인 항목:
  - `.env.local`에 `GEMINI_API_KEY`를 넣은 뒤 상세 모달에서 요약 생성
  - API 키가 없을 때 사용자에게 실패 메시지가 보이는지 확인
  - ESC/배경 클릭 닫기, 편집/삭제 기존 기능이 깨지지 않는지 확인

## 데이터 저장 정책

요약은 **메모 데이터에 저장하지 않고 상세보기 모달에서 요청 시 생성**합니다. 기존 `Memo` 타입과 LocalStorage 데이터 구조를 변경하지 않아 기존 메모와 호환됩니다.