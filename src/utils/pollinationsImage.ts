/**
 * Pollinations 공개 이미지 엔드포인트 URL 생성
 * @see https://pollinations.ai/
 */
export function buildPollinationsImageUrl(prompt: string, seed: number): string {
  const encoded = encodeURIComponent(prompt.trim())
  const params = new URLSearchParams({
    width: '1920',
    height: '1080',
    nologo: 'true',
    seed: String(seed),
  })
  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`
}
