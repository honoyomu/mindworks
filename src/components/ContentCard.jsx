import React, { useState, useEffect } from 'react'
import { database } from '../api/database'
import { formatDate } from '../utils/fileUtils'
import { storage } from '../utils/storage'

function ContentCard({ content, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const [fileUrl, setFileUrl] = useState(null)
  const [loadingFile, setLoadingFile] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (content.file_path && (content.content_type === 'image' || content.content_type === 'audio' || content.content_type === 'video' || content.content_type === 'document')) {
      loadFileFromStorage()
    }
  }, [content.file_path, content.content_type])

  const loadFileFromStorage = async () => {
    setLoadingFile(true)
    try {
      const data = await storage.getFile(content.file_path)
      if (data) {
        setFileUrl(data)
      }
    } catch (error) {
      console.error('Error loading file from storage:', error)
    } finally {
      setLoadingFile(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return
    }

    setDeleting(true)
    try {
      await database.deleteRecord('content_records', content.id)
      
      // Also delete file from IndexedDB if exists
      if (content.file_path) {
        await storage.deleteFile(content.file_path)
      }
      
      onDelete(content.id)
    } catch (error) {
      console.error('Error deleting content:', error)
      alert('Failed to delete content. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const getContentIcon = () => {
    const iconClass = "w-5 h-5 sm:w-6 sm:h-6"
    switch (content.content_type) {
      case 'text':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'image':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'audio':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        )
      case 'video':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'link':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  const renderContent = () => {
    if (content.content_type === 'link') {
      return (
        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 group/link">
          <a
            href={content.content}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover/link:scale-110 transition-transform">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span className="text-blue-700 font-medium text-sm sm:text-base truncate max-w-[300px]">
                {new URL(content.content).hostname}
              </span>
            </div>
            <svg className="w-5 h-5 text-blue-600 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )
    } else if (content.content_type === 'image' && content.file_path) {
      if (loadingFile) {
        return (
          <div className="mt-2 h-48 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )
      }
      
      return fileUrl ? (
        <div className="mt-3 space-y-2">
          <div className="relative overflow-hidden rounded-lg group/image">
            <img
              src={fileUrl}
              alt={content.title}
              className={`w-full sm:max-w-md h-auto object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ maxHeight: '300px' }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Image failed to load:', content.title)
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+'
              }}
            />
          </div>
          <button
            onClick={async () => {
              try {
                const response = await fetch(fileUrl)
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = content.content || 'image.jpg'
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
              } catch (error) {
                console.error('Error downloading image:', error)
              }
            }}
            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 rounded-lg text-sm font-medium hover:from-violet-200 hover:to-pink-200 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        </div>
      ) : (
        <div className="mt-2 text-gray-500 text-xs sm:text-sm">
          {content.content}
        </div>
      )
    } else if (content.content_type === 'audio' && fileUrl) {
      return (
        <div className="mt-3">
          <audio controls className="w-full">
            <source src={fileUrl} type={content.metadata?.mime_type || 'audio/mpeg'} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )
    } else if (content.content_type === 'video' && fileUrl) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <video controls className="w-full max-h-64">
            <source src={fileUrl} type={content.metadata?.mime_type || 'video/mp4'} />
            Your browser does not support the video element.
          </video>
        </div>
      )
    } else if (content.file_path && fileUrl) {
      // For other files with stored data
      return (
        <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{content.content}</p>
                {content.metadata?.file_size && (
                  <p className="text-xs text-gray-500">
                    {(content.metadata.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
            <a
              href={fileUrl}
              download={content.content}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      )
    } else {
      return (
        <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">{content.content}</p>
        </div>
      )
    }
  }

  return (
    <div className="card p-4 sm:p-6 group hover:shadow-xl transition-all duration-300 slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-100 to-pink-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform duration-300">
              {getContentIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate pr-2">
              {content.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">{formatDate(content.created_at)}</span>
            </div>
            <div className="mt-2 sm:mt-3">
              {renderContent()}
            </div>
            {content.tags && content.tags.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(tagsExpanded ? content.tags : content.tags.slice(0, 3)).map((tag, index) => (
                    <span
                      key={index}
                      className="tag text-xs hover:scale-105 transition-all duration-200 cursor-default animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {content.tags.length > 3 && (
                    <button
                      onClick={() => setTagsExpanded(!tagsExpanded)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-200"
                    >
                      {tagsExpanded ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Show Less
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          +{content.tags.length - 3} More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start ml-2 sm:ml-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
            title="Delete"
          >
            {deleting ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContentCard