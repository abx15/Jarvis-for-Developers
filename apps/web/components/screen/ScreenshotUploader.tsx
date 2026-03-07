'use client'

import React, { useState, useCallback, useRef } from 'react'
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
  ZoomIn,
  Download
} from 'lucide-react'

interface Screenshot {
  id: string
  dataUrl: string
  filename: string
  size: number
  timestamp: Date
}

interface ScreenshotUploaderProps {
  onUpload: (screenshot: Screenshot) => void
  onError: (error: string) => void
  maxFileSize?: number // in bytes
  acceptedFormats?: string[]
}

export function ScreenshotUploader({
  onUpload,
  onError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp']
}: ScreenshotUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFormats.some(format => file.type === format)) {
      return `Invalid file type. Accepted formats: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      return `File too large. Maximum size: ${Math.round(maxFileSize / 1024 / 1024)}MB`
    }
    
    return null
  }, [acceptedFormats, maxFileSize])

  const processFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      onError(validationError)
      return
    }

    setIsUploading(true)
    
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const screenshot: Screenshot = {
        id: Math.random().toString(36).substr(2, 9),
        dataUrl,
        filename: file.name,
        size: file.size,
        timestamp: new Date()
      }
      
      setPreview(dataUrl)
      onUpload(screenshot)
      setIsUploading(false)
    }
    
    reader.onerror = () => {
      onError('Failed to read file')
      setIsUploading(false)
    }
    
    reader.readAsDataURL(file)
  }, [validateFile, onError, onUpload])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    processFile(file)
  }, [processFile])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    
    const file = event.dataTransfer.files[0]
    if (!file) return
    
    processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const clearPreview = useCallback(() => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const downloadImage = useCallback(() => {
    if (!preview) return
    
    const link = document.createElement('a')
    link.href = preview
    link.download = `screenshot-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [preview])

  if (preview) {
    return (
      <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-green-400" />
            <span>Screenshot Preview</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadImage}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearPreview}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={preview}
              alt="Screenshot preview"
              className="w-full h-auto max-h-96 object-contain rounded-lg bg-black/20"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={clearPreview}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Different</span>
            </button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2">
          <Upload className="w-5 h-5 text-green-400" />
          <span>Upload Screenshot</span>
        </h3>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-white/20 hover:border-white/30'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
              <p className="text-lg font-medium">Processing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragging ? 'Drop your image here' : 'Drag & drop your screenshot'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Accepted formats:</strong> {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
          </p>
          <p>
            <strong>Maximum file size:</strong> {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>
    </div>
  )
}
