// IndexedDB storage for large files
const DB_NAME = 'AIPersonalAssistant'
const DB_VERSION = 1
const STORE_NAME = 'files'

let db = null

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export const storage = {
  async saveFile(fileId, dataUrl) {
    if (!db) await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ id: fileId, data: dataUrl })
      
      request.onsuccess = () => resolve(fileId)
      request.onerror = () => reject(request.error)
    })
  },
  
  async getFile(fileId) {
    if (!db) await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(fileId)
      
      request.onsuccess = () => resolve(request.result?.data)
      request.onerror = () => reject(request.error)
    })
  },
  
  async deleteFile(fileId) {
    if (!db) await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(fileId)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}