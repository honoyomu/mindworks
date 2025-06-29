import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY

console.log('Testing OpenRouter API...')

async function testAI() {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are an AI assistant that analyzes content and generates appropriate titles and tags. Return ONLY valid JSON without markdown formatting or code blocks.'
        }, {
          role: 'user',
          content: 'Analyze this text content and generate a descriptive title and relevant tags. Content: "Meeting notes about Project Alpha discussing the new feature roadmap for Q1 2025". Return the response as JSON with "title" and "tags" fields. Tags should be an array of strings.'
        }],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'AI Personal Assistant Test',
          'Content-Type': 'application/json'
        }
      }
    )
    
    console.log('✓ AI response received:', response.data.choices[0].message.content)
    
    try {
      const result = response.data.choices[0].message.content
      const parsed = JSON.parse(result)
      console.log('✓ Parsed JSON:', parsed)
    } catch (e) {
      console.log('Note: Response might contain markdown, would need extraction')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message)
  }
}

testAI()