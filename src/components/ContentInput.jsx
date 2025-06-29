import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../api/database'
import { ai } from '../api/ai'
import { fileToBase64, saveFileLocally, getContentType } from '../utils/fileUtils'
import { storage } from '../utils/storage'

function ContentInput({ onContentAdded }) {
  const { user } = useAuth()
  const [inputType, setInputType] = useState('text')
  const [textContent, setTextContent] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setProcessing(true)

    try {
      let content = ''
      let contentType = inputType
      let filePath = null
      let aiAnalysis = null

      if (inputType === 'text' && textContent.trim()) {
        content = textContent
        aiAnalysis = await ai.analyzeContent(content, 'text')
      } else if (inputType === 'link' && linkUrl.trim()) {
        content = linkUrl
        contentType = 'link'
        aiAnalysis = await ai.analyzeContent(content, 'link')
      } else if (inputType === 'file' && selectedFile) {
        contentType = getContentType(selectedFile)
        
        if (contentType === 'image') {
          const base64 = await fileToBase64(selectedFile)
          const dataUrl = `data:${selectedFile.type};base64,${base64}`
          
          // Generate a unique file ID
          const fileId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`
          
          // Store image in IndexedDB
          await storage.saveFile(fileId, dataUrl)
          
          // Store only the file ID in database
          content = selectedFile.name
          filePath = fileId
          
          // AI analysis with base64
          aiAnalysis = await ai.analyzeContent(selectedFile.name, 'image', base64)
        } else {
          // For non-image files, just store the filename
          content = selectedFile.name
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(7)}`
          
          // Create blob URL for non-image files
          const blobUrl = URL.createObjectURL(selectedFile)
          await storage.saveFile(fileId, blobUrl)
          
          filePath = fileId
          aiAnalysis = await ai.analyzeContent(selectedFile.name, contentType)
        }
      } else {
        setError('Please provide content')
        setProcessing(false)
        return
      }

      const newRecord = {
        user_id: user.user_id,
        content_type: contentType,
        title: aiAnalysis.title || 'Untitled',
        content: content,
        file_path: filePath,
        tags: aiAnalysis.tags || [],
        metadata: {
          original_filename: selectedFile?.name,
          file_size: selectedFile?.size,
          mime_type: selectedFile?.type
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const response = await database.createRecord('content_records', newRecord)
      onContentAdded(response[0])

      setTextContent('')
      setLinkUrl('')
      setSelectedFile(null)
      if (inputType === 'file') {
        document.getElementById('file-input').value = ''
      }
    } catch (error) {
      console.error('Error saving content:', error)
      setError('Failed to save content. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Add New Content</h2>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 bg-gradient-to-r from-gray-100 to-gray-200/50 rounded-lg">
            <div className={`absolute h-[calc(100%-8px)] w-[calc(33.333%-4px)] bg-white rounded-md shadow-md transition-all duration-300 ease-out ${
              inputType === 'text' ? 'left-1' : inputType === 'file' ? 'left-[calc(33.333%+2px)]' : 'left-[calc(66.666%+3px)]'
            }`}></div>
            <button
              type="button"
              onClick={() => setInputType('text')}
              className={`relative z-10 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                inputType === 'text'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${inputType === 'text' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden xs:inline">Text</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType('file')}
              className={`relative z-10 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                inputType === 'file'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${inputType === 'file' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="hidden xs:inline">File</span>
            </button>
            <button
              type="button"
              onClick={() => setInputType('link')}
              className={`relative z-10 flex items-center justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                inputType === 'link'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${inputType === 'link' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="hidden xs:inline">Link</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {inputType === 'text' && (
          <div className="space-y-2">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter your text content..."
              className="input-field resize-none"
              rows="4"
            />
            <p className="text-xs text-gray-500">Write notes, ideas, or any text content</p>
          </div>
        )}

        {inputType === 'file' && (
          <div className="space-y-2">
            <label className="block">
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-all duration-300 cursor-pointer group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <svg className={`mx-auto h-12 w-12 text-gray-400 transition-all duration-300 ${selectedFile ? 'text-indigo-500 scale-110' : 'group-hover:scale-110 group-hover:text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="sr-only"
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                  {selectedFile ? (
                    <div className="mt-3 animate-fade-in">
                      <div className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedFile.name}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images, audio, video, and documents
                      </p>
                    </>
                  )}
                </div>
              </div>
            </label>
          </div>
        )}

        {inputType === 'link' && (
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-field pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Save bookmarks and web links</p>
          </div>
        )}

        <button
          type="submit"
          disabled={processing}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Content</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ContentInput