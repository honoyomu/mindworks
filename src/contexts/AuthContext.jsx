import React, { createContext, useState, useContext, useEffect } from 'react'
import { auth } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      const userInfo = auth.parseToken(token)
      if (userInfo && userInfo.exp * 1000 > Date.now()) {
        setUser(userInfo)
      } else {
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await auth.login(email, password)
      const { token: newToken } = response
      localStorage.setItem('token', newToken)
      setToken(newToken)
      const userInfo = auth.parseToken(newToken)
      setUser(userInfo)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const signUp = async (name, email, password) => {
    try {
      const response = await auth.signUp(name, email, password)
      const { token: newToken } = response
      localStorage.setItem('token', newToken)
      setToken(newToken)
      const userInfo = auth.parseToken(newToken)
      setUser(userInfo)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Sign up failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}