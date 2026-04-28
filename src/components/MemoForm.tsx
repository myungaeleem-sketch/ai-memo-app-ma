'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
} from '@/types/memo'
import MemoMarkdown from '@/components/MemoMarkdown'
import { suggestMemoTagsAction } from '@/app/actions/memoAi'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => void | Promise<void>
  editingMemo?: Memo | null
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [tagGenerating, setTagGenerating] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingMemo) {
      setFormData({
        title: editingMemo.title,
        content: editingMemo.content,
        category: editingMemo.category,
        tags: editingMemo.tags,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'personal',
        tags: [],
      })
    }
    setTagInput('')
    setTagError(null)
    setTagGenerating(false)
  }, [editingMemo, isOpen])

  const handleAiTags = useCallback(async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setTagError('제목과 내용을 입력한 뒤 AI 태그를 생성할 수 있습니다.')
      return
    }

    setTagGenerating(true)
    setTagError(null)

    try {
      const data = await suggestMemoTagsAction(
        formData.title,
        formData.content,
        formData.tags
      )

      if (data.error) {
        setTagError(data.error)
        return
      }

      if (!data.tags?.length) {
        setTagError('추가할 새 태그가 없습니다.')
        return
      }

      setFormData(prev => {
        const seen = new Set(prev.tags.map(t => t.toLowerCase()))
        const merged = [...prev.tags]
        for (const raw of data.tags!) {
          const t = raw.trim().replace(/^#+/u, '').trim()
          if (!t) continue
          const key = t.toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          merged.push(t)
        }
        return { ...prev, tags: merged }
      })
    } catch {
      setTagError('네트워크 오류가 발생했습니다.')
    } finally {
      setTagGenerating(false)
    }
  }, [formData.title, formData.content, formData.tags])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    await onSubmit(formData)
    onClose()
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="placeholder-gray-400 text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* 내용 (Markdown) */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                내용 *{' '}
                <span className="font-normal text-gray-500">
                  (Markdown 지원: 제목, 목록, 표 등)
                </span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="placeholder-gray-400 text-gray-800 min-h-[240px] w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y font-mono text-sm"
                  placeholder="Markdown으로 작성할 수 있습니다."
                  rows={12}
                  required
                  spellCheck={false}
                />
                <div className="flex flex-col min-h-[240px] rounded-lg border border-gray-200 bg-gray-50 p-3 overflow-hidden">
                  <span className="text-xs font-medium text-gray-500 mb-2 shrink-0">
                    미리보기
                  </span>
                  <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                    {formData.content.trim() ? (
                      <MemoMarkdown>{formData.content}</MemoMarkdown>
                    ) : (
                      <p className="text-sm text-gray-400">
                        내용을 입력하면 여기에 렌더링됩니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="flex flex-wrap gap-2 mb-3 items-stretch">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-black flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => void handleAiTags()}
                  disabled={tagGenerating}
                  className="px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-900 text-sm font-medium hover:bg-indigo-100 rounded-lg transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:ml-auto"
                >
                  {tagGenerating ? '태그 생성 중...' : 'AI 태그 생성'}
                </button>
              </div>

              {tagError ? (
                <p role="alert" className="text-sm text-red-600 mb-2">
                  {tagError}
                </p>
              ) : null}

              {/* 태그 목록 */}
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-3 h-3"
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
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                {editingMemo ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
