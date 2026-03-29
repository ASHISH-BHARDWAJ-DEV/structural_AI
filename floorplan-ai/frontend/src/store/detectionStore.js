import { create } from 'zustand'

const useDetectionStore = create((set, get) => ({
  // Upload state
  uploadedFile: null,
  uploadedPreview: null,
  
  // Detection state
  isDetecting: false,
  detectionResult: null,
  detectionError: null,
  
  // Settings
  confidenceThreshold: 0.25,
  
  // Actions
  setUploadedFile: (file, preview) => set({ 
    uploadedFile: file, 
    uploadedPreview: preview,
    detectionResult: null,
    detectionError: null 
  }),
  
  clearUpload: () => set({ 
    uploadedFile: null, 
    uploadedPreview: null,
    detectionResult: null,
    detectionError: null 
  }),
  
  setConfidenceThreshold: (value) => set({ confidenceThreshold: value }),
  
  setDetecting: (value) => set({ isDetecting: value }),
  
  setDetectionResult: (result) => set({ 
    detectionResult: result, 
    detectionError: null,
    isDetecting: false 
  }),
  
  setDetectionError: (error) => set({ 
    detectionError: error,
    detectionResult: null,
    isDetecting: false 
  }),
  
  reset: () => set({
    uploadedFile: null,
    uploadedPreview: null,
    isDetecting: false,
    detectionResult: null,
    detectionError: null,
    confidenceThreshold: 0.25,
  }),
}))

export default useDetectionStore
