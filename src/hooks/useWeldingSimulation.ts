import { useState, useCallback, useEffect } from 'react'
import { 
  WeldingType, 
  WeldingParameters, 
  RealTimeMetrics, 
  WeldingSession,
  SensorData,
  ARMarkerData 
} from '../types'

// Welding technique parameters
const WELDING_PARAMETERS: Record<WeldingType, WeldingParameters> = {
  MIG: {
    technique: 'MIG',
    idealAngle: { min: 70, max: 80 },
    idealDistance: { min: 10, max: 15 },
    idealSpeed: { min: 5, max: 15 },
    scoring: {
      angle: 40,
      distance: 30,
      speed: 20,
      smoothness: 10
    }
  },
  TIG: {
    technique: 'TIG',
    idealAngle: { min: 60, max: 75 },
    idealDistance: { min: 2, max: 5 },
    idealSpeed: { min: 3, max: 8 },
    scoring: {
      angle: 40,
      distance: 30,
      speed: 20,
      smoothness: 10
    }
  },
  ELECTRODO: {
    technique: 'ELECTRODO',
    idealAngle: { min: 60, max: 80 },
    idealDistance: { min: 5, max: 12 },
    idealSpeed: { min: 8, max: 20 },
    scoring: {
      angle: 40,
      distance: 30,
      speed: 20,
      smoothness: 10
    }
  }
}

export const useWeldingSimulation = () => {
  const [currentTechnique, setCurrentTechnique] = useState<WeldingType>('MIG')
  const [isRecording, setIsRecording] = useState(false)
  const [currentSession, setCurrentSession] = useState<WeldingSession | null>(null)
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetrics | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  // Get current welding parameters
  const getCurrentParameters = useCallback((): WeldingParameters => {
    return WELDING_PARAMETERS[currentTechnique]
  }, [currentTechnique])

  // Start welding session
  const startSession = useCallback((technique: WeldingType) => {
    const parameters = WELDING_PARAMETERS[technique]
    const session: WeldingSession = {
      id: `session_${Date.now()}`,
      technique,
      startTime: Date.now(),
      duration: 0,
      parameters,
      sensorData: [],
      markerData: [],
      metrics: [],
      finalScore: 0,
      grade: 'F'
    }

    setCurrentSession(session)
    setCurrentTechnique(technique)
    setIsRecording(true)
    setSessionStartTime(Date.now())

    return session
  }, [])

  // Stop welding session
  const stopSession = useCallback(() => {
    if (!currentSession || !sessionStartTime) return null

    const endTime = Date.now()
    const duration = endTime - sessionStartTime

    // Calculate final score based on all metrics
    const finalScore = calculateFinalScore(currentSession.metrics, currentSession.parameters)
    const grade = getGrade(finalScore)

    const completedSession: WeldingSession = {
      ...currentSession,
      endTime,
      duration,
      finalScore,
      grade
    }

    setCurrentSession(completedSession)
    setIsRecording(false)
    setSessionStartTime(null)

    return completedSession
  }, [currentSession, sessionStartTime])

  // Update session with new sensor and marker data
  const updateSession = useCallback((sensorData: SensorData, markerData: ARMarkerData | null) => {
    if (!isRecording || !currentSession) return

    const metrics = calculateRealTimeMetrics(sensorData, markerData, currentSession.parameters)
    
    setCurrentMetrics(metrics)

    const updatedSession = {
      ...currentSession,
      sensorData: [...currentSession.sensorData, sensorData],
      markerData: markerData ? [...currentSession.markerData, markerData] : currentSession.markerData,
      metrics: [...currentSession.metrics, metrics]
    }

    setCurrentSession(updatedSession)
  }, [isRecording, currentSession])

  // Calculate real-time metrics
  const calculateRealTimeMetrics = useCallback((
    sensorData: SensorData, 
    markerData: ARMarkerData | null, 
    parameters: WeldingParameters
  ): RealTimeMetrics => {
    
    let angle = 0
    let distance = 0
    let speed = 0

    // Calculate angle from gyroscope data (simplified)
    if (sensorData.gyroscope) {
      angle = Math.abs(sensorData.gyroscope.beta) // Use beta rotation as angle
    }

    // Calculate distance from AR marker
    if (markerData) {
      distance = markerData.position.z
    }

    // Calculate speed from acceleration (simplified)
    if (sensorData.acceleration) {
      const accelerationMagnitude = Math.sqrt(
        sensorData.acceleration.x ** 2 + 
        sensorData.acceleration.y ** 2 + 
        sensorData.acceleration.z ** 2
      )
      speed = Math.abs(accelerationMagnitude - 9.8) // Remove gravity
    }

    // Calculate scores
    const angleScore = calculateAngleScore(angle, parameters.idealAngle)
    const distanceScore = calculateDistanceScore(distance, parameters.idealDistance)
    const speedScore = calculateSpeedScore(speed, parameters.idealSpeed)
    const smoothnessScore = calculateSmoothnessScore(sensorData)

    // Overall quality score
    const qualityScore = (
      angleScore * parameters.scoring.angle +
      distanceScore * parameters.scoring.distance +
      speedScore * parameters.scoring.speed +
      smoothnessScore * parameters.scoring.smoothness
    ) / 100

    const stabilityScore = (angleScore + distanceScore + speedScore) / 3

    return {
      currentAngle: angle,
      currentDistance: distance,
      currentSpeed: speed,
      stabilityScore,
      qualityScore,
      isInRange: angleScore > 70 && distanceScore > 70,
      timestamp: Date.now()
    }
  }, [])

  // Calculate angle score
  const calculateAngleScore = (angle: number, idealRange: { min: number, max: number }): number => {
    if (angle >= idealRange.min && angle <= idealRange.max) {
      return 100
    }
    
    const deviation = Math.min(
      Math.abs(angle - idealRange.min),
      Math.abs(angle - idealRange.max)
    )
    
    return Math.max(0, 100 - deviation * 2)
  }

  // Calculate distance score
  const calculateDistanceScore = (distance: number, idealRange: { min: number, max: number }): number => {
    if (distance >= idealRange.min && distance <= idealRange.max) {
      return 100
    }
    
    const deviation = Math.min(
      Math.abs(distance - idealRange.min),
      Math.abs(distance - idealRange.max)
    )
    
    return Math.max(0, 100 - deviation * 5)
  }

  // Calculate speed score
  const calculateSpeedScore = (speed: number, idealRange: { min: number, max: number }): number => {
    if (speed >= idealRange.min && speed <= idealRange.max) {
      return 100
    }
    
    const deviation = Math.min(
      Math.abs(speed - idealRange.min),
      Math.abs(speed - idealRange.max)
    )
    
    return Math.max(0, 100 - deviation * 3)
  }

  // Calculate smoothness score based on sensor variance
  const calculateSmoothnessScore = (sensorData: SensorData): number => {
    // Calculate variance in acceleration (simplified)
    const accel = sensorData.acceleration
    const variance = (accel.x ** 2 + accel.y ** 2 + accel.z ** 2) / 3
    
    // Lower variance = smoother movement
    return Math.max(0, 100 - variance * 10)
  }

  // Calculate final session score
  const calculateFinalScore = (metrics: RealTimeMetrics[], parameters: WeldingParameters): number => {
    if (metrics.length === 0) return 0

    const avgAngleScore = metrics.reduce((sum, m) => 
      sum + calculateAngleScore(m.currentAngle, parameters.idealAngle), 0
    ) / metrics.length

    const avgDistanceScore = metrics.reduce((sum, m) => 
      sum + calculateDistanceScore(m.currentDistance, parameters.idealDistance), 0
    ) / metrics.length

    const avgSpeedScore = metrics.reduce((sum, m) => 
      sum + calculateSpeedScore(m.currentSpeed, parameters.idealSpeed), 0
    ) / metrics.length

    const avgSmoothnessScore = metrics.reduce((sum, m) => 
      sum + calculateSmoothnessScore({
        acceleration: { x: 0, y: 0, z: 0 },
        gyroscope: { alpha: 0, beta: m.currentAngle, gamma: 0 },
        timestamp: m.timestamp
      }), 0
    ) / metrics.length

    return (
      avgAngleScore * parameters.scoring.angle +
      avgDistanceScore * parameters.scoring.distance +
      avgSpeedScore * parameters.scoring.speed +
      avgSmoothnessScore * parameters.scoring.smoothness
    ) / 100
  }

  // Get grade based on score
  const getGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  // Get simulation status
  const getSimulationStatus = useCallback(() => {
    return {
      isRecording,
      currentTechnique,
      currentSession,
      currentMetrics,
      sessionDuration: sessionStartTime ? Date.now() - sessionStartTime : 0,
      parameters: getCurrentParameters()
    }
  }, [isRecording, currentTechnique, currentSession, currentMetrics, sessionStartTime, getCurrentParameters])

  return {
    currentTechnique,
    isRecording,
    currentSession,
    currentMetrics,
    startSession,
    stopSession,
    updateSession,
    getCurrentParameters,
    getSimulationStatus
  }
}