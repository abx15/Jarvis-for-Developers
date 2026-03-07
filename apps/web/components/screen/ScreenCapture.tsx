'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  Monitor,
  Camera,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface ScreenCaptureProps {
  onCapture: (imageData: string, filename: string) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function ScreenCapture({ onCapture, onError, disabled = false }: ScreenCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [captureMode, setCaptureMode] = useState<'screen' | 'upload' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startScreenCapture = useCallback(async () => {
    if (disabled) return
    
    setIsCapturing(true)
    setCaptureMode('screen')
    
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
      
      streamRef.current = stream
      setIsStreaming(true)
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Listen for stream end (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopCapture()
      })
      
    } catch (error) {
      console.error('Screen capture failed:', error)
      onError('Failed to start screen capture. Please ensure you grant permission.')
      setIsCapturing(false)
      setCaptureMode(null)
    }
  }, [disabled, onError])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to blob and send to parent
    canvas.toBlob((blob: Blob | null) => {
      if (!blob) return
      
      const reader = new FileReader()
      reader.onload = () => {
        const imageData = reader.result as string
        const filename = `screen-capture-${Date.now()}.png`
        onCapture(imageData, filename)
        stopCapture()
      }
      reader.readAsDataURL(blob)
    }, 'image/png')
  }, [onCapture])

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      streamRef.current = null
    }
    
    setIsStreaming(false)
    setIsCapturing(false)
    setCaptureMode(null)
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file')
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('Image file must be less than 10MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = () => {
      const imageData = reader.result as string
      onCapture(imageData, file.name)
    }
    reader.readAsDataURL(file)
  }, [onCapture, onError])

  const resetCapture = useCallback(() => {
    stopCapture()
    setCaptureMode(null)
  }, [stopCapture])

  if (captureMode === 'screen' && isStreaming) {
    return (
      <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span>Screen Capture</span>
          </h3>
          <button
            onClick={resetCapture}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto max-h-96 object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={captureFrame}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Screenshot</span>
            </button>
            
            <button
              onClick={stopCapture}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Click "Capture Screenshot" to take a picture of your screen
          </p>
        </div>
      </div>
    )
  }

  if (captureMode === 'upload') {
    return (
      <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Upload className="w-5 h-5 text-green-400" />
            <span>Upload Screenshot</span>
          </h3>
          <button
            onClick={resetCapture}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your screenshot here</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="screenshot-upload"
            />
            <label
              htmlFor="screenshot-upload"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span>Choose File</span>
            </label>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Supported formats: PNG, JPG, JPEG, GIF, BMP, WebP (Max 10MB)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Screen Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Capture your screen or upload a screenshot to get AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={startScreenCapture}
            disabled={disabled || isCapturing}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Monitor className="w-5 h-5" />
                <span>Capture Screen</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setCaptureMode('upload')}
            disabled={disabled}
            className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Image</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Error Detection</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Code Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>UI Insights</span>
          </div>
        </div>
      </div>
    </div>
  )
}
