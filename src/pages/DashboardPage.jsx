import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ContentInput from '../components/ContentInput'
import ContentList from '../components/ContentList'
import SearchBar from '../components/SearchBar'
import { database } from '../api/database'
import { ai } from '../api/ai'

function DashboardPage() {
  const { user, logout } = useAuth()
  const [contents, setContents] = useState([])
  const [filteredContents, setFilteredContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileInput, setShowMobileInput] = useState(false)
  const [sortBy, setSortBy] = useState(null) // null, 'all', 'image', 'text', 'link'

  useEffect(() => {
    fetchContents()
  }, [])

  useEffect(() => {
    let filtered = contents
    
    // Apply search filter
    if (searchQuery) {
      handleSearch(searchQuery)
      return
    }
    
    // Apply sort filter
    if (sortBy && sortBy !== 'all') {
      filtered = contents.filter(content => content.content_type === sortBy)
    }
    
    setFilteredContents(filtered)
  }, [searchQuery, contents, sortBy])

  const fetchContents = async () => {
    try {
      const response = await database.getRecords('content_records', {
        user_id: user.user_id,
        order: 'created_at:desc'
      })
      setContents(response.data || [])
      setFilteredContents(response.data || [])
    } catch (error) {
      console.error('Error fetching contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setFilteredContents(contents)
      return
    }

    try {
      const relevantIds = await ai.searchContent(query, contents)
      const filtered = contents.filter(content => 
        relevantIds.includes(content.id)
      )
      setFilteredContents(filtered)
    } catch (error) {
      console.error('Search error:', error)
      const filtered = contents.filter(content => 
        content.title.toLowerCase().includes(query.toLowerCase()) ||
        content.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      setFilteredContents(filtered)
    }
  }

  const handleContentAdded = (newContent) => {
    setContents([newContent, ...contents])
  }

  const handleContentDeleted = (contentId) => {
    setContents(contents.filter(c => c.id !== contentId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <nav className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent truncate">
                AI Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium hidden xs:block max-w-[100px] sm:max-w-none truncate">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-violet-600 p-1.5 sm:p-2 hover:bg-violet-50 rounded-xl transition-all duration-200"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative">
        <div className="mb-6 sm:mb-8 text-center fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back<span className="hidden sm:inline">, {user.name}</span>!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Store and organize your content with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="fade-in" style={{ animationDelay: '0.1s' }}>
              <ContentInput onContentAdded={handleContentAdded} />
            </div>
            
            <div className="card p-4 sm:p-6 fade-in hidden sm:block overflow-hidden relative" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full blur-2xl opacity-50 -mr-16 -mt-16"></div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 relative flex items-center">
                <svg className="w-5 h-5 mr-2 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quick Stats
              </h3>
              <div className="space-y-4 relative">
                <div 
                  onClick={() => setSortBy(sortBy === 'all' ? null : 'all')}
                  className={`flex items-center justify-between group cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                    sortBy === 'all' ? 'bg-gradient-to-r from-violet-100 to-pink-100 ring-2 ring-violet-400' : 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">Total Items</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">{contents.length}</span>
                </div>
                <div 
                  onClick={() => setSortBy(sortBy === 'image' ? null : 'image')}
                  className={`flex items-center justify-between group cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                    sortBy === 'image' ? 'bg-gradient-to-r from-purple-100 to-pink-100 ring-2 ring-purple-400' : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">Images</span>
                  </div>
                  <span className="text-lg font-semibold text-purple-600 group-hover:scale-110 transition-transform inline-block">
                    {contents.filter(c => c.content_type === 'image').length}
                  </span>
                </div>
                <div 
                  onClick={() => setSortBy(sortBy === 'text' ? null : 'text')}
                  className={`flex items-center justify-between group cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                    sortBy === 'text' ? 'bg-gradient-to-r from-blue-100 to-violet-100 ring-2 ring-blue-400' : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">Notes</span>
                  </div>
                  <span className="text-lg font-semibold text-blue-600 group-hover:scale-110 transition-transform inline-block">
                    {contents.filter(c => c.content_type === 'text').length}
                  </span>
                </div>
                <div 
                  onClick={() => setSortBy(sortBy === 'link' ? null : 'link')}
                  className={`flex items-center justify-between group cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                    sortBy === 'link' ? 'bg-gradient-to-r from-teal-100 to-blue-100 ring-2 ring-teal-400' : 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">Links</span>
                  </div>
                  <span className="text-lg font-semibold text-teal-600 group-hover:scale-110 transition-transform inline-block">
                    {contents.filter(c => c.content_type === 'link').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="fade-in" style={{ animationDelay: '0.15s' }}>
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search with AI..."
              />
              {sortBy && (
                <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      Showing: <span className="font-semibold text-violet-600">
                        {sortBy === 'all' ? 'All Items' : 
                         sortBy === 'image' ? 'Images Only' : 
                         sortBy === 'text' ? 'Notes Only' : 
                         sortBy === 'link' ? 'Links Only' : 'All'}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setSortBy(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 hover:bg-white rounded-lg transition-all"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card p-4 sm:p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2"></div>
                      <div className="h-16 sm:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                      <div className="flex gap-2">
                        <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                        <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                <ContentList 
                  contents={filteredContents}
                  onDelete={handleContentDeleted}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        {showMobileInput ? (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowMobileInput(false)}>
            <div className="absolute bottom-20 right-6 left-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <ContentInput onContentAdded={(newContent) => {
                handleContentAdded(newContent)
                setShowMobileInput(false)
              }} />
            </div>
          </div>
        ) : null}
        <button
          onClick={() => setShowMobileInput(!showMobileInput)}
          className={`w-14 h-14 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 ${
            showMobileInput ? 'rotate-45 scale-110' : 'hover:scale-110'
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Mobile Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 px-4 py-3 sm:hidden z-30">
        <div className="flex justify-around text-center">
          <div 
            className={`group cursor-pointer ${sortBy === 'all' ? 'opacity-100' : 'opacity-70'}`}
            onClick={() => setSortBy(sortBy === 'all' ? null : 'all')}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent group-active:scale-110 transition-transform inline-block">{contents.length}</span>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div 
            className={`group cursor-pointer ${sortBy === 'image' ? 'opacity-100' : 'opacity-70'}`}
            onClick={() => setSortBy(sortBy === 'image' ? null : 'image')}
          >
            <span className="text-lg font-semibold text-purple-600 group-active:scale-110 transition-transform inline-block">{contents.filter(c => c.content_type === 'image').length}</span>
            <p className="text-xs text-gray-600">Images</p>
          </div>
          <div 
            className={`group cursor-pointer ${sortBy === 'text' ? 'opacity-100' : 'opacity-70'}`}
            onClick={() => setSortBy(sortBy === 'text' ? null : 'text')}
          >
            <span className="text-lg font-semibold text-blue-600 group-active:scale-110 transition-transform inline-block">{contents.filter(c => c.content_type === 'text').length}</span>
            <p className="text-xs text-gray-600">Notes</p>
          </div>
          <div 
            className={`group cursor-pointer ${sortBy === 'link' ? 'opacity-100' : 'opacity-70'}`}
            onClick={() => setSortBy(sortBy === 'link' ? null : 'link')}
          >
            <span className="text-lg font-semibold text-teal-600 group-active:scale-110 transition-transform inline-block">{contents.filter(c => c.content_type === 'link').length}</span>
            <p className="text-xs text-gray-600">Links</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage