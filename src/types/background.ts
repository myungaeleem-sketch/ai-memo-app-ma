export interface BackgroundSettings {
  /** 이미지 생성에 사용한 프롬프트 */
  prompt: string
  /** 동일 프롬프트라도 이미지가 바뀌도록 고정할 시드 */
  seed: number
}
