import type { BackgroundSettings } from '@/types/background'

const STORAGE_KEY = 'memo-app-background-settings'

export const backgroundStorage = {
  get: (): BackgroundSettings | null => {
    if (typeof window === 'undefined') return null

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as BackgroundSettings
      if (
        typeof parsed.prompt === 'string' &&
        typeof parsed.seed === 'number' &&
        parsed.prompt.trim().length > 0
      ) {
        return { prompt: parsed.prompt.trim(), seed: parsed.seed }
      }
      return null
    } catch {
      return null
    }
  },

  save: (settings: BackgroundSettings): void => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving background settings:', error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing background settings:', error)
    }
  },
}
