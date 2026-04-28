'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BackgroundSettings } from '@/types/background'
import { backgroundStorage } from '@/utils/backgroundStorage'
import { buildPollinationsImageUrl } from '@/utils/pollinationsImage'

export function useBackgroundImage() {
  const [settings, setSettings] = useState<BackgroundSettings | null>(null)

  useEffect(() => {
    setSettings(backgroundStorage.get())
  }, [])

  const imageUrl = useMemo(() => {
    if (!settings) return null
    return buildPollinationsImageUrl(settings.prompt, settings.seed)
  }, [settings])

  const applyPrompt = useCallback((prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed) return

    const next: BackgroundSettings = {
      prompt: trimmed,
      seed: Math.floor(Math.random() * 1_000_000_000),
    }
    backgroundStorage.save(next)
    setSettings(next)
  }, [])

  /** 같은 프롬프트로 다른 이미지를 받고 싶을 때 */
  const regenerateWithSamePrompt = useCallback(() => {
    if (!settings) return
    applyPrompt(settings.prompt)
  }, [settings, applyPrompt])

  const clearBackground = useCallback(() => {
    backgroundStorage.clear()
    setSettings(null)
  }, [])

  return {
    imageUrl,
    settings,
    applyPrompt,
    regenerateWithSamePrompt,
    clearBackground,
  }
}
