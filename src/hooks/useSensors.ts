import { useState, useEffect, useCallback } from 'react'
import { SensorData, PermissionState } from '../types'

export const useSensors = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'prompt',
    motion: 'prompt',
    orientation: 'prompt',
    notification: 'prompt'
  })
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Request permissions
  const requestPermissions = useCallback(async () => {
    try {
      setError(null)

      // Camera permission
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })
          setPermissions(prev => ({ ...prev, camera: 'granted' }))
        } catch (err) {
          setPermissions(prev => ({ ...prev, camera: 'denied' }))
          setError('Camera permission denied')
        }
      }

      // Device Motion permission (iOS)
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission()
          setPermissions(prev => ({ ...prev, motion: permission }))
        } catch (err) {
          setPermissions(prev => ({ ...prev, motion: 'denied' }))
        }
      } else {
        // Android and other platforms
        setPermissions(prev => ({ ...prev, motion: 'granted' }))
      }

      // Device Orientation permission (iOS)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission()
          setPermissions(prev => ({ ...prev, orientation: permission }))
        } catch (err) {
          setPermissions(prev => ({ ...prev, orientation: 'denied' }))
        }
      } else {
        // Android and other platforms
        setPermissions(prev => ({ ...prev, orientation: 'granted' }))
      }

      // Notification permission
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission()
          setPermissions(prev => ({ ...prev, notification: permission }))
        } catch (err) {
          setPermissions(prev => ({ ...prev, notification: 'denied' }))
        }
      }

    } catch (err) {
      setError('Failed to request permissions')
    }
  }, [])

  // Start sensor tracking
  const startSensors = useCallback(() => {
    if (!permissions.motion || !permissions.orientation) {
      setError('Sensor permissions required')
      return
    }

    setIsActive(true)
    setError(null)

    // Device Motion Event
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { acceleration, rotationRate } = event
      if (acceleration && rotationRate) {
        setSensorData(prev => ({
          acceleration: {
            x: acceleration.x || 0,
            y: acceleration.y || 0,
            z: acceleration.z || 0
          },
          gyroscope: {
            alpha: rotationRate.alpha || 0,
            beta: rotationRate.beta || 0,
            gamma: rotationRate.gamma || 0
          },
          timestamp: Date.now()
        }))
      }
    }

    // Device Orientation Event
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (sensorData) {
        setSensorData(prev => prev ? {
          ...prev,
          gyroscope: {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0
          }
        } : null)
      }
    }

    // Add event listeners
    window.addEventListener('devicemotion', handleDeviceMotion)
    window.addEventListener('deviceorientation', handleDeviceOrientation)

    // Cleanup function
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion)
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [permissions.motion, permissions.orientation, sensorData])

  // Stop sensor tracking
  const stopSensors = useCallback(() => {
    setIsActive(false)
    setSensorData(null)
  }, [])

  // Check sensor availability
  const isSensorAvailable = useCallback(() => {
    return {
      motion: typeof DeviceMotionEvent !== 'undefined',
      orientation: typeof DeviceOrientationEvent !== 'undefined',
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }
  }, [])

  // Get sensor status
  const getSensorStatus = useCallback(() => {
    return {
      isActive,
      hasError: !!error,
      error,
      permissions,
      isAvailable: isSensorAvailable()
    }
  }, [isActive, error, permissions, isSensorAvailable])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopSensors()
      }
    }
  }, [isActive, stopSensors])

  return {
    sensorData,
    permissions,
    isActive,
    error,
    requestPermissions,
    startSensors,
    stopSensors,
    isSensorAvailable,
    getSensorStatus
  }
}