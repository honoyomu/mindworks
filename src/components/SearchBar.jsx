import React, { useState } from 'react'

function SearchBar({ value, onChange, placeholder }) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-xl blur-xl transition-all duration-500 ${isFocused ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}`}></div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className={`h-5 w-5 transition-all duration-300 ${isFocused ? 'text-violet-500 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 transition-all duration-300 ${
            isFocused 
              ? 'border-transparent ring-2 ring-violet-500 shadow-lg transform scale-[1.02]' 
              : 'border-gray-200/50 shadow-sm hover:shadow-md hover:border-violet-300'
          }`}
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center group/clear"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full scale-0 group-hover/clear:scale-150 transition-transform duration-300 opacity-20"></div>
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-200 relative z-10 group-hover/clear:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        )}
        <div className={`absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500 ${isFocused ? 'scale-x-100' : 'scale-x-0'}`}></div>
      </div>
    </div>
  )
}

export default SearchBar