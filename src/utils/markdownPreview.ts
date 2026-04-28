/**
 * 목록 카드 등에서 Markdown 문법을 제거한 평문 미리보기 문자열을 만든다.
 */
export function stripMarkdownForPreview(markdown: string): string {
  let text = markdown
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/`([^`]+)`/g, '$1')
  text = text.replace(/```[\s\S]*?```/g, ' ')
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  text = text.replace(/^>\s+/gm, '')
  text = text.replace(/^[-*+]\s+/gm, '')
  text = text.replace(/^\d+\.\s+/gm, '')
  text = text.replace(/\n+/g, ' ')
  text = text.replace(/\s+/g, ' ')
  return text.trim()
}
