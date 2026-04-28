'use client'

import { useEffect, useState } from 'react'

interface BackgroundSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialPrompt: string
  onApply: (prompt: string) => void
  onClear: () => void
  onRegenerate: () => void
  hasBackground: boolean
}

export default function BackgroundSettingsModal({
  isOpen,
  onClose,
  initialPrompt,
  onApply,
  onClear,
  onRegenerate,
  hasBackground,
}: BackgroundSettingsModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt)

  useEffect(() => {
    if (isOpen) setPrompt(initialPrompt)
  }, [isOpen, initialPrompt])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = () => onClose()

  const handleApply = () => {
    if (!prompt.trim()) {
      alert('배경을 만들 프롬프트를 입력해 주세요.')
      return
    }
    onApply(prompt)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bg-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2
                id="bg-modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                배경 이미지
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                원하는 장면을 한글 또는 영어로 설명하면 AI 이미지가 배경으로
                적용됩니다. (Pollinations 공개 API 사용)
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <label htmlFor="bg-prompt" className="sr-only">
            배경 프롬프트
          </label>
          <textarea
            id="bg-prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="예: 부드러운 파스텔 톤의 추상적인 물결 패턴, 밝은 분위기"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y text-sm"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              생성 후 적용
            </button>
            {hasBackground && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onRegenerate()
                    onClose()
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  같은 설명으로 다시 생성
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClear()
                    onClose()
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                >
                  배경 제거
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
