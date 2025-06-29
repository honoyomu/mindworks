import axios from 'axios'
import { OPENROUTER_API_KEY } from './config'

const aiApi = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': window.location.origin,
    'X-Title': 'AI Personal Assistant',
    'Content-Type': 'application/json'
  }
})

export const ai = {
  async analyzeContent(content, contentType, imageBase64 = null) {
    let messages = []
    
    if (contentType === 'image' && imageBase64) {
      messages = [{
        role: 'system',
        content: 'You are a multilingual AI assistant that analyzes content and generates appropriate titles and tags. IMPORTANT: Always match the language of the user\'s input - if they use Chinese, respond in Chinese; if they use English, respond in English. Return ONLY valid JSON without markdown formatting or code blocks.'
      }, {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image and generate a descriptive title and relevant tags. Match the language based on the filename or context. If the filename contains Chinese characters, use Chinese for title and tags. Otherwise use English. Return the response as JSON with "title" and "tags" fields. Tags should be an array of strings. Filename: ' + (content || 'image')
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }]
    } else {
      messages = [{
        role: 'system',
        content: 'You are a multilingual AI assistant that analyzes content and generates appropriate titles and tags. IMPORTANT: Always match the language of the user\'s input - if they use Chinese, respond in Chinese; if they use English, respond in English. Return ONLY valid JSON without markdown formatting or code blocks.'
      }, {
        role: 'user',
        content: `Analyze this ${contentType} content and generate a descriptive title and relevant tags. IMPORTANT: Use the same language as the content - if the content is in Chinese, generate Chinese title and tags; if in English, use English. Content: "${content}". Return the response as JSON with "title" and "tags" fields. Tags should be an array of strings.`
      }]
    }

    const response = await aiApi.post('/chat/completions', {
      model: contentType === 'image' ? 'openai/gpt-4o' : 'openai/gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 200
    })

    const result = response.data.choices[0].message.content
    
    try {
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
        result.match(/```\s*([\s\S]*?)\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : result
      
      return JSON.parse(jsonString.trim())
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return {
        title: contentType === 'image' ? 'Uploaded Image' : 'New Content',
        tags: [contentType]
      }
    }
  },

  async searchContent(query, records) {
    const messages = [{
      role: 'system',
      content: 'You are a multilingual AI assistant that helps with fuzzy search. You understand both Chinese and English queries and can match them against content in any language. Return ONLY valid JSON without markdown formatting or code blocks.'
    }, {
      role: 'user',
      content: `Find relevant content records that match the query: "${query}". The query can be in any language (Chinese or English) and should match against content, titles, and tags in any language. Here are the records: ${JSON.stringify(records)}. Return a JSON array of record IDs that are relevant to the query, sorted by relevance. Return empty array if no matches found.`
    }]

    const response = await aiApi.post('/chat/completions', {
      model: 'openai/gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 500
    })

    const result = response.data.choices[0].message.content
    
    try {
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
        result.match(/```\s*([\s\S]*?)\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : result
      
      return JSON.parse(jsonString.trim())
    } catch (error) {
      console.error('Error parsing search results:', error)
      return []
    }
  }
}