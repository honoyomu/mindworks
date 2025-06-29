import axios from 'axios'
import { API_BASE_URL, PROJECT_ID } from './config'

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/project/${PROJECT_ID}`,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const auth = {
  async signUp(name, email, password) {
    const response = await authApi.post('/sign-up', { name, email, password })
    return response.data
  },

  async login(email, password) {
    const response = await authApi.post('/login', { email, password })
    return response.data
  },

  async verifyToken(token) {
    const response = await authApi.post('/verify-token', { token })
    return response.data
  },

  parseToken(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error parsing token:', error)
      return null
    }
  }
}