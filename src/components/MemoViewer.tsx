'use client'

import { useCallback, useEffect, useState } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MemoMarkdown from '@/components/MemoMarkdown'
import { summarizeMemoAction } from '@/app/actions/memoAi'

interface MemoViewerProps {
  isOpen: boolean
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoViewer({
  isOpen,
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoViewerProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
    setSummaryLoading(false)
  }, [memo?.id, isOpen])

  const handleSummarize = useCallback(async () => {
    if (!memo) return

    if (!memo.content.trim()) {
      setSummaryError('요약할 내용이 없습니다.')
      return
    }

    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const data = await summarizeMemoAction(memo.title, memo.content)

      if (data.error) {
        setSummaryError(data.error)
        setSummary(null)
        return
      }

      if (data.summary) {
        setSummary(data.summary)
      } else {
        setSummaryError('요약 결과가 비어 있습니다.')
      }
    } catch {
      setSummaryError('네트워크 오류가 발생했습니다.')
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }, [memo])

  if (!isOpen || !memo) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const categoryLabel =
    MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
    memo.category

  const handleBackdropClick = () => {
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  const contentEmpty = !memo.content.trim()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="memo-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h2
                id="memo-viewer-title"
                className="text-xl font-semibold text-gray-900 mb-3 break-words"
              >
                {memo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {categoryLabel}
                </span>
                <span className="text-xs text-gray-500">
                  수정 {formatDate(memo.updatedAt)}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  작성 {formatDate(memo.createdAt)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSummarize()}
              disabled={summaryLoading || contentEmpty}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {summaryLoading ? '요약 중...' : 'AI 요약'}
            </button>
          </div>

          {summaryError ? (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {summaryError}
            </div>
          ) : null}

          {summary ? (
            <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50/80 px-4 py-3">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                AI 요약
              </h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {summary}
              </p>
            </div>
          ) : null}

          <div className="mb-6">
            <h3 className="sr-only">내용</h3>
            <MemoMarkdown>{memo.content}</MemoMarkdown>
          </div>

          {memo.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-2">태그</h3>
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onEdit(memo)}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              편집
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors ml-auto"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
