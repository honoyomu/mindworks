import axios from 'axios'
import { API_BASE_URL, API_KEY } from './config'

const dbApi = axios.create({
  baseURL: `${API_BASE_URL}/database`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
})

export const database = {
  async getRecords(tableName, params = {}) {
    const response = await dbApi.get(`/tables/${tableName}/records`, { params })
    return response.data
  },

  async createRecord(tableName, data) {
    const recordData = Array.isArray(data) ? data : [data]
    const response = await dbApi.post(`/tables/${tableName}/records`, recordData)
    return response.data
  },

  async updateRecord(tableName, recordId, data) {
    const response = await dbApi.patch(`/tables/${tableName}/records/${recordId}`, data)
    return response.data
  },

  async deleteRecord(tableName, recordId) {
    const response = await dbApi.delete(`/tables/${tableName}/records/${recordId}`)
    return response.data
  },

  async deleteMultipleRecords(tableName, recordIds) {
    const response = await dbApi.delete(`/tables/${tableName}/records`, {
      data: { recordIds }
    })
    return response.data
  }
}