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
      toast.error('Invalid file type.')
      return
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const preview = URL.createObjectURL(file)
      setUploadedFile(file, preview)
      toast.success('Image uploaded!')
    }
  }, [setUploadedFile])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="voxel-panel"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b-4 border-black">
        <h2 className="text-2xl font-black text-black flex items-center gap-3 pixel-text uppercase tracking-widest">
          <Upload className="w-6 h-6 stroke-[3]" />
          Upload Floor Plan
        </h2>
        {uploadedFile && (
          <button
            onClick={clearUpload}
            className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors text-black shadow-[2px_2px_0_0_#000]"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        )}
      </div>
      
      <div
        {...getRootProps()}
        className={`border-4 border-black p-8 text-center cursor-pointer transition-all duration-200 bg-white ${
          isDragActive
            ? 'bg-yellow-100 -translate-y-1 shadow-[4px_4px_0_0_#000]'
            : uploadedFile
            ? 'bg-teal-50'
            : 'hover:bg-yellow-50 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {uploadedFile ? (
            <>
              <div className="w-16 h-16 bg-teal-200 border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0_0_#000]">
                <Image className="w-8 h-8 text-black" />
              </div>
              <p className="text-black font-black mb-1 pixel-text text-xl">{uploadedFile.name}</p>
              <p className="text-black/60 font-bold pixel-text text-lg">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-black font-bold uppercase pixel-text text-md mt-4 p-2 bg-yellow-400 border-2 border-black">
                Click to replace
              </p>
            </>
          ) : (
            <>
              <div className={`w-16 h-16 border-4 border-black flex items-center justify-center mb-4 transition-colors shadow-[4px_4px_0_0_#000] ${
                isDragActive ? 'bg-yellow-400' : 'bg-white'
              }`}>
                <Upload className="w-8 h-8 text-black stroke-[3]" />
              </div>
              <p className="text-black font-black mb-2 pixel-text text-2xl uppercase">
                {isDragActive ? 'DROP!' : 'DRAG & DROP'}
              </p>
              <p className="text-black/60 font-bold pixel-text text-lg mb-4 uppercase">
                or click to browse
              </p>
              <p className="text-black bg-black/10 px-3 py-1 font-bold pixel-text text-sm uppercase">
                PNG, JPG • Max 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
