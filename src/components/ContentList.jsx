import React from 'react'
import ContentCard from './ContentCard'

function ContentList({ contents, onDelete }) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Start adding text, files, or links to build your personal knowledge base with AI-powered organization.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contents.map((content, index) => (
        <div
          key={content.id}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ContentCard
            content={content}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}

export default ContentList