export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

export const saveFileLocally = (file, type) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(7)
  const extension = file.name.split('.').pop()
  const fileName = `${timestamp}_${randomString}.${extension}`
  
  let folderPath = '/uploads/'
  if (type === 'image') {
    folderPath += 'images/'
  } else if (type === 'document') {
    folderPath += 'documents/'
  } else {
    folderPath += 'media/'
  }
  
  const filePath = folderPath + fileName
  
  return filePath
}

export const getContentType = (file) => {
  const mimeType = file.type
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
  return 'file'
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}