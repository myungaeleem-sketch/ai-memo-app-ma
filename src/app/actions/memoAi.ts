'use server'

import {
  generateMemoSummaryText,
  generateMemoTagSuggestions,
} from '@/lib/gemini/memoAi'

export async function summarizeMemoAction(
  title: string,
  content: string
): Promise<{ summary?: string; error?: string }> {
  const titleStr = typeof title === 'string' ? title : ''
  const contentStr = typeof content === 'string' ? content : ''

  if (!contentStr.trim()) {
    return { error: '요약할 메모 내용이 비어 있습니다.' }
  }

  try {
    const summary = await generateMemoSummaryText(titleStr, contentStr)
    return { summary }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '요약 요청 중 오류가 발생했습니다.'
    return { error: message }
  }
}

export async function suggestMemoTagsAction(
  title: string,
  content: string,
  existingTags: string[]
): Promise<{ tags?: string[]; error?: string }> {
  const titleStr = typeof title === 'string' ? title : ''
  const contentStr = typeof content === 'string' ? content : ''

  if (!contentStr.trim()) {
    return { error: '태그를 만들려면 메모 본문이 필요합니다.' }
  }

  try {
    const tags = await generateMemoTagSuggestions(
      titleStr,
      contentStr,
      existingTags
    )
    return { tags }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '태그 생성 중 오류가 발생했습니다.'
    return { error: message }
  }
}
