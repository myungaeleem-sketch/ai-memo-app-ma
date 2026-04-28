'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MemoMarkdownProps {
  children: string
  className?: string
}

export default function MemoMarkdown({
  children,
  className = '',
}: MemoMarkdownProps) {
  return (
    <div
      className={`prose prose-sm max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-blue-600 prose-pre:bg-gray-900 prose-pre:text-gray-100 ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
