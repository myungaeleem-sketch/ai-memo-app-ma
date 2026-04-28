'use client'

import { useState } from 'react'
import { useMemos } from '@/hooks/useMemos'
import { useBackgroundImage } from '@/hooks/useBackgroundImage'
import { Memo, MemoFormData } from '@/types/memo'
import MemoList from '@/components/MemoList'
import MemoForm from '@/components/MemoForm'
import MemoViewer from '@/components/MemoViewer'
import BackgroundSettingsModal from '@/components/BackgroundSettingsModal'

export default function Home() {
  const {
    imageUrl,
    settings,
    applyPrompt,
    regenerateWithSamePrompt,
    clearBackground,
  } = useBackgroundImage()

  const {
    memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo,
    deleteMemo,
    searchMemos,
    filterByCategory,
  } = useMemos()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [viewingMemo, setViewingMemo] = useState<Memo | null>(null)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)

  const handleCreateMemo = async (formData: MemoFormData) => {
    await createMemo(formData)
  }

  const handleUpdateMemo = async (formData: MemoFormData) => {
    if (editingMemo) {
      await updateMemo(editingMemo.id, formData)
      setEditingMemo(null)
    }
  }

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo)
    setIsFormOpen(true)
  }

  const handleViewMemo = (memo: Memo) => {
    setViewingMemo(memo)
  }

  const handleCloseViewer = () => {
    setViewingMemo(null)
  }

  const handleEditFromViewer = (memo: Memo) => {
    setViewingMemo(null)
    handleEditMemo(memo)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  return (
    <div className="min-h-screen relative bg-gray-50">
      {imageUrl ? (
        <>
          <div
            aria-hidden
            className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-gray-50"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div
            aria-hidden
            className="fixed inset-0 -z-10 bg-white/75 backdrop-blur-[2px]"
          />
        </>
      ) : null}

      {/* 헤더 */}
      <header
        className={
          imageUrl
            ? 'border-b border-gray-200/80 bg-white/85 backdrop-blur-sm'
            : 'border-b border-gray-200 bg-white'
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">📝 메모 앱</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => setIsBackgroundModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1.5 sm:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">배경 이미지</span>
                <span className="sm:hidden">배경</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onViewMemo={handleViewMemo}
          onEditMemo={handleEditMemo}
          onDeleteMemo={deleteMemo}
          stats={stats}
        />
      </main>

      {/* 모달 폼 */}
      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
        editingMemo={editingMemo}
      />

      <MemoViewer
        isOpen={viewingMemo !== null}
        memo={viewingMemo}
        onClose={handleCloseViewer}
        onEdit={handleEditFromViewer}
        onDelete={deleteMemo}
      />

      <BackgroundSettingsModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        initialPrompt={settings?.prompt ?? ''}
        onApply={applyPrompt}
        onClear={clearBackground}
        onRegenerate={regenerateWithSamePrompt}
        hasBackground={!!settings}
      />
    </div>
  )
}
