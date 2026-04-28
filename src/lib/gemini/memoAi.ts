import { GoogleGenAI, Type } from '@google/genai'

export const MEMO_AI_MODEL_ID = 'gemini-2.5-flash-lite'

export async function generateMemoSummaryText(
  title: string,
  content: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('서버에 GEMINI_API_KEY가 설정되어 있지 않습니다.')
  }

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: MEMO_AI_MODEL_ID,
    contents: `제목: ${title}\n\n본문:\n${content}`,
    config: {
      systemInstruction:
        '다음 메모를 한국어로 3줄 이내로 요약하세요.\n핵심 행동 항목이 있으면 마지막 줄에 포함하세요.',
      temperature: 0.4,
      maxOutputTokens: 512,
    },
  })

  const summary = response.text?.trim()
  if (!summary) {
    throw new Error('요약을 생성하지 못했습니다.')
  }
  return summary
}

function parseExistingTags(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.trim())
    .filter(Boolean)
}

function normalizeSuggestedTags(
  raw: unknown,
  existingLower: Set<string>
): string[] {
  if (!Array.isArray(raw)) return []

  const result: string[] = []

  for (const item of raw) {
    if (typeof item !== 'string') continue
    const tag = item.trim().replace(/^#+/u, '').trim()
    if (!tag) continue

    const key = tag.toLowerCase()
    if (existingLower.has(key)) continue

    existingLower.add(key)
    result.push(tag)
    if (result.length >= 5) break
  }

  return result
}

export async function generateMemoTagSuggestions(
  title: string,
  content: string,
  existingTags: unknown
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('서버에 GEMINI_API_KEY가 설정되어 있지 않습니다.')
  }

  const existingList = parseExistingTags(existingTags)
  const excludeSet = new Set(existingList.map(t => t.toLowerCase()))

  const existingNote =
    existingList.length > 0
      ? `이미 사용 중인 태그(절대 반복하지 마세요): ${existingList.join(', ')}`
      : '기존 태그 없음'

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: MEMO_AI_MODEL_ID,
    contents: `제목: ${title}\n\n본문:\n${content}\n\n${existingNote}`,
    config: {
      systemInstruction:
        '메모 제목과 본문을 바탕으로 검색·분류에 쓸 짧은 한국어 태그를 제안합니다. 해시(#) 없이 단어만 사용합니다. 이미 나열된 태그와 같은 단어는 포함하지 마세요.',
      temperature: 0.5,
      maxOutputTokens: 256,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        minItems: 1,
        maxItems: 5,
      },
    },
  })

  const text = response.text?.trim()
  if (!text) {
    throw new Error('태그를 생성하지 못했습니다.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    throw new Error('태그 응답 형식이 올바르지 않습니다.')
  }

  return normalizeSuggestedTags(parsed, excludeSet)
}
