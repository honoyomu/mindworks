import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = 'https://insforge-backend-740c116fd723.herokuapp.com'
const PROJECT_ID = process.env.VITE_INSFORGE_PROJECT_ID
const API_KEY = process.env.VITE_INSFORGE_API_KEY

console.log('Testing InsForge API...')
console.log('PROJECT_ID:', PROJECT_ID)

async function testAPIs() {
  try {
    // Test 1: Sign up
    console.log('\n1. Testing Sign Up...')
    const testEmail = `test${Date.now()}@example.com`
    const signUpResponse = await axios.post(
      `${API_BASE_URL}/project/${PROJECT_ID}/sign-up`,
      {
        name: 'Test User',
        email: testEmail,
        password: 'testpassword123'
      }
    )
    console.log('✓ Sign up successful:', signUpResponse.data.token ? 'Token received' : 'No token')
    
    // Test 2: Login
    console.log('\n2. Testing Login...')
    const loginResponse = await axios.post(
      `${API_BASE_URL}/project/${PROJECT_ID}/login`,
      {
        email: testEmail,
        password: 'testpassword123'
      }
    )
    console.log('✓ Login successful:', loginResponse.data.token ? 'Token received' : 'No token')
    
    // Parse token to get user_id
    const token = loginResponse.data.token
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    const userData = JSON.parse(jsonPayload)
    console.log('User ID:', userData.user_id)
    
    // Test 3: Create content record
    console.log('\n3. Testing Create Content Record...')
    const createResponse = await axios.post(
      `${API_BASE_URL}/database/tables/content_records/records`,
      [{
        user_id: userData.user_id,
        content_type: 'text',
        title: 'Test Content',
        content: 'This is a test content',
        tags: ['test', 'api'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }],
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    )
    console.log('✓ Content created:', createResponse.data[0].id)
    
    // Test 4: Get content records
    console.log('\n4. Testing Get Content Records...')
    const getResponse = await axios.get(
      `${API_BASE_URL}/database/tables/content_records/records?user_id=${userData.user_id}`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    )
    console.log('✓ Records retrieved:', getResponse.data.count, 'records found')
    
    console.log('\n✅ All API tests passed!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message)
  }
}

testAPIs()