import { useState, useEffect, useCallback, useRef } from 'react'
import { ARMarkerData } from '../types'

export const useCameraAR = () => {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<ARMarkerData[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processingRef = useRef<boolean>(false)

  // Start camera and AR detection
  const startCamera = useCallback(async () => {
    try {
      setError(null)

      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera
        }
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      setIsActive(true)
      
      // Start AR detection after camera is ready
      setTimeout(() => {
        startARDetection()
      }, 1000)

    } catch (err) {
      setError('Camera access denied or not available')
      setIsActive(false)
    }
  }, [])

  // Stop camera and AR detection
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsActive(false)
    setIsDetecting(false)
    setMarkers([])
    processingRef.current = false
  }, [stream])

  // Start AR marker detection
  const startARDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsDetecting(true)
    processingRef.current = true

    const detectMarkers = () => {
      if (!processingRef.current || !isActive) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!video || !ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectMarkers)
        return
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Process image for AR markers
      processImageForMarkers(imageData).then(markerData => {
        if (markerData) {
          setMarkers(prev => {
            const updated = prev.filter(m => Date.now() - m.timestamp < 5000) // Keep markers from last 5 seconds
            return [...updated, markerData]
          })
        }
      })

      // Continue detection
      requestAnimationFrame(detectMarkers)
    }

    detectMarkers()
  }, [isActive])

  // Process image for AR markers (simplified version)
  const processImageForMarkers = async (imageData: ImageData): Promise<ARMarkerData | null> => {
    // This is a simplified implementation
    // In a real implementation, you would use a library like js-aruco or opencv.js
    
    const { data, width, height } = imageData
    
    // Convert to grayscale and look for square patterns
    const grayData = new Uint8ClampedArray(width * height)
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayData[i / 4] = gray
    }

    // Look for square patterns (simplified corner detection)
    const squares = findSquarePatterns(grayData, width, height)
    
    if (squares.length > 0) {
      // Return the largest detected square as marker
      const largestSquare = squares.reduce((prev, current) => 
        (current.area > prev.area) ? current : prev
      )

      return {
        position: {
          x: largestSquare.centerX,
          y: largestSquare.centerY,
          z: calculateDistance(largestSquare.size) // Simplified distance calculation
        },
        rotation: {
          pitch: 0, // Would need more complex calculation
          yaw: 0,
          roll: 0
        },
        size: largestSquare.size,
        confidence: 0.8, // Simplified confidence
        timestamp: Date.now()
      }
    }

    return null
  }

  // Find square patterns in grayscale image
  const findSquarePatterns = (grayData: Uint8ClampedArray, width: number, height: number) => {
    const squares: Array<{
      centerX: number
      centerY: number
      size: number
      area: number
    }> = []

    const threshold = 100
    const minSize = 20
    const maxSize = Math.min(width, height) / 2

    for (let y = minSize; y < height - minSize; y += 5) {
      for (let x = minSize; x < width - minSize; x += 5) {
        const centerValue = grayData[y * width + x]
        
        // Check if center is dark (marker)
        if (centerValue < threshold) {
          // Look for square pattern around center
          let size = minSize
          let isSquare = true

          while (size < maxSize && isSquare) {
            // Check corners of potential square
            const corner1 = grayData[(y - size) * width + (x - size)]
            const corner2 = grayData[(y - size) * width + (x + size)]
            const corner3 = grayData[(y + size) * width + (x - size)]
            const corner4 = grayData[(y + size) * width + (x + size)]

            // If corners are bright and center is dark, might be a square
            if (corner1 > threshold && corner2 > threshold && corner3 > threshold && corner4 > threshold) {
              size += 5
            } else {
              break
            }
          }

          if (size > minSize + 5) {
            squares.push({
              centerX: x,
              centerY: y,
              size: size - 5,
              area: (size - 5) * (size - 5)
            })
          }
        }
      }
    }

    return squares
  }

  // Calculate distance based on marker size (simplified)
  const calculateDistance = (markerSize: number): number => {
    // Simplified distance calculation
    // In reality, this would be based on camera calibration and marker physical size
    const referenceSize = 100 // pixels
    const referenceDistance = 300 // mm
    return (referenceSize * referenceDistance) / markerSize
  }

  // Get camera status
  const getCameraStatus = useCallback(() => {
    return {
      isActive,
      isDetecting,
      hasError: !!error,
      error,
      markersCount: markers.length,
      lastMarker: markers.length > 0 ? markers[markers.length - 1] : null
    }
  }, [isActive, isDetecting, error, markers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    canvasRef,
    isActive,
    isDetecting,
    error,
    markers,
    startCamera,
    stopCamera,
    startARDetection,
    getCameraStatus
  }
}