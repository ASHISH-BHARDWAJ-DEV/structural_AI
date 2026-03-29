import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds — Gemini calls may take longer
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

export const analyzeMaterials = async (detectionJson, scaleFactor = 0.01) => {
  const response = await api.post('/api/materials', {
    detection_json: detectionJson,
    scale_factor: scaleFactor,
  })
  return response.data
}

export const generateCostBreakdown = async (
  elementAnalyses,
  structuralSummary = null,
  projectTitle = 'Structural Cost Estimate'
) => {
  const response = await api.post('/api/cost-breakdown', {
    element_analyses: elementAnalyses,
    structural_summary: structuralSummary,
    project_title: projectTitle,
  })
  return response.data
}

export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
