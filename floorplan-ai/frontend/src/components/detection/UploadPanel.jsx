import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, Image, X } from 'lucide-react'
import useDetectionStore from '../../store/detectionStore'
import toast from 'react-hot-toast'

export default function UploadPanel() {
  const { uploadedFile, setUploadedFile, clearUpload } = useDetectionStore()
  
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Invalid file type. Please upload PNG, JPG, or JPEG images.')
      return
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const preview = URL.createObjectURL(file)
      setUploadedFile(file, preview)
      toast.success('Image uploaded successfully!')
    }
  }, [setUploadedFile])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary-400" />
          Upload Floor Plan
        </h2>
        {uploadedFile && (
          <button
            onClick={clearUpload}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary-500 bg-primary-500/10'
            : uploadedFile
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {uploadedFile ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Image className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-medium mb-1">{uploadedFile.name}</p>
              <p className="text-slate-400 text-sm">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-primary-400 text-sm mt-2">
                Click or drag to replace
              </p>
            </>
          ) : (
            <>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                isDragActive ? 'bg-primary-500/20' : 'bg-white/10'
              }`}>
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary-400' : 'text-slate-400'}`} />
              </div>
              <p className="text-white font-medium mb-1">
                {isDragActive ? 'Drop your image here' : 'Drag & drop your floor plan'}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                or click to browse
              </p>
              <p className="text-slate-500 text-xs">
                Supports PNG, JPG, JPEG • Max 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
