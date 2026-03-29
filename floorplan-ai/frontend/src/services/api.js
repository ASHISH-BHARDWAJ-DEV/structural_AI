import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for model inference
})

export const detectFloorPlan = async (file, confidence = 0.25) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('confidence', confidence.toString())

  const response = await api.post('/api/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
