/**
 * Welding calculations and evaluation utilities
 */

import { SensorData, ARMarkerData, WeldingParameters, RealTimeMetrics } from '../types'

export interface WeldingMetrics {
  angleAccuracy: number
  distanceStability: number
  speedConsistency: number
  movementSmoothness: number
  overallScore: number
}

export interface PositionData {
  x: number
  y: number
  z: number
  timestamp: number
}

/**
 * Calculate angle from sensor data
 */
export const calculateAngle = (sensorData: SensorData): number => {
  if (!sensorData.gyroscope) return 0

  // Use beta rotation (rotation around x-axis) as the welding angle
  // This represents the forward/backward tilt
  const beta = sensorData.gyroscope.beta || 0
  
  // Normalize to 0-180 degrees
  let normalizedAngle = beta
  if (normalizedAngle < 0) {
    normalizedAngle = Math.abs(normalizedAngle)
  }
  if (normalizedAngle > 180) {
    normalizedAngle = 360 - normalizedAngle
  }

  return Math.abs(normalizedAngle)
}

/**
 * Calculate distance from AR marker
 */
export const calculateDistance = (markerData: ARMarkerData | null): number => {
  if (!markerData) return 0

  // Distance is already calculated in the AR tracking system
  // This is the Z-axis distance in millimeters
  return Math.abs(markerData.position.z)
}

/**
 * Calculate speed from position changes
 */
export const calculateSpeed = (
  currentPosition: PositionData,
  previousPosition: PositionData | null
): number => {
  if (!previousPosition) return 0

  const dx = currentPosition.x - previousPosition.x
  const dy = currentPosition.y - previousPosition.y
  const dz = currentPosition.z - previousPosition.z

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const timeDiff = currentPosition.timestamp - previousPosition.timestamp

  // Convert to mm/s (assuming positions are in mm and time in ms)
  return (distance / timeDiff) * 1000
}

/**
 * Calculate acceleration magnitude from sensor data
 */
export const calculateAccelerationMagnitude = (sensorData: SensorData): number => {
  const { acceleration } = sensorData
  return Math.sqrt(
    acceleration.x ** 2 + 
    acceleration.y ** 2 + 
    acceleration.z ** 2
  )
}

/**
 * Evaluate angle accuracy
 */
export const evaluateAngleAccuracy = (
  angle: number,
  idealRange: { min: number; max: number }
): number => {
  if (angle >= idealRange.min && angle <= idealRange.max) {
    return 100 // Perfect score
  }

  const deviation = Math.min(
    Math.abs(angle - idealRange.min),
    Math.abs(angle - idealRange.max)
  )

  // Score decreases linearly with deviation
  // Each degree off reduces score by 2 points (max 100 points lost)
  return Math.max(0, 100 - (deviation * 2))
}

/**
 * Evaluate distance stability
 */
export const evaluateDistanceStability = (
  currentDistance: number,
  previousDistances: number[],
  idealRange: { min: number; max: number }
): number => {
  if (currentDistance < idealRange.min || currentDistance > idealRange.max) {
    return 0 // Out of range
  }

  if (previousDistances.length === 0) {
    return 100 // First measurement
  }

  // Calculate variance in distance measurements
  const avgDistance = previousDistances.reduce((sum, d) => sum + d, 0) / previousDistances.length
  const variance = previousDistances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / previousDistances.length
  const standardDeviation = Math.sqrt(variance)

  // Lower variance = higher stability score
  // Scale: 0-5mm std dev = 100-0 score
  const stabilityScore = Math.max(0, 100 - (standardDeviation * 20))

  return stabilityScore
}

/**
 * Evaluate speed consistency
 */
export const evaluateSpeedConsistency = (
  currentSpeed: number,
  previousSpeeds: number[],
  idealRange: { min: number; max: number }
): number => {
  if (currentSpeed < idealRange.min || currentSpeed > idealRange.max) {
    return 0 // Out of range
  }

  if (previousSpeeds.length === 0) {
    return 100 // First measurement
  }

  // Calculate speed variance
  const avgSpeed = previousSpeeds.reduce((sum, s) => sum + s, 0) / previousSpeeds.length
  const variance = previousSpeeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / previousSpeeds.length
  const standardDeviation = Math.sqrt(variance)

  // Lower variance = higher consistency score
  // Scale: 0-3 mm/s std dev = 100-0 score
  const consistencyScore = Math.max(0, 100 - (standardDeviation * 30))

  return consistencyScore
}

/**
 * Evaluate movement smoothness
 */
export const evaluateMovementSmoothness = (
  sensorData: SensorData,
  previousSensorData: SensorData | null
): number => {
  if (!previousSensorData) {
    return 100 // First measurement
  }

  // Calculate jerk (rate of change of acceleration)
  const currentAccel = calculateAccelerationMagnitude(sensorData)
  const previousAccel = calculateAccelerationMagnitude(previousSensorData)
  
  const jerk = Math.abs(currentAccel - previousAccel)

  // Lower jerk = smoother movement
  // Scale: 0-5 m/s³ jerk = 100-0 score
  const smoothnessScore = Math.max(0, 100 - (jerk * 20))

  return smoothnessScore
}

/**
 * Calculate overall welding metrics
 */
export const calculateWeldingMetrics = (
  sensorData: SensorData,
  markerData: ARMarkerData | null,
  previousData: {
    sensorData: SensorData | null
    markerData: ARMarkerData | null
    distances: number[]
    speeds: number[]
  },
  parameters: WeldingParameters
): WeldingMetrics => {
  const currentAngle = calculateAngle(sensorData)
  const currentDistance = calculateDistance(markerData)
  
  // Create position data for speed calculation
  const currentPosition: PositionData = {
    x: markerData?.position.x || 0,
    y: markerData?.position.y || 0,
    z: currentDistance,
    timestamp: sensorData.timestamp
  }

  const previousPosition: PositionData | null = previousData.markerData ? {
    x: previousData.markerData.position.x,
    y: previousData.markerData.position.y,
    z: calculateDistance(previousData.markerData),
    timestamp: previousData.sensorData?.timestamp || 0
  } : null

  const currentSpeed = calculateSpeed(currentPosition, previousPosition)

  // Evaluate individual metrics
  const angleAccuracy = evaluateAngleAccuracy(currentAngle, parameters.idealAngle)
  const distanceStability = evaluateDistanceStability(
    currentDistance, 
    previousData.distances, 
    parameters.idealDistance
  )
  const speedConsistency = evaluateSpeedConsistency(
    currentSpeed, 
    previousData.speeds, 
    parameters.idealSpeed
  )
  const movementSmoothness = evaluateMovementSmoothness(
    sensorData, 
    previousData.sensorData
  )

  // Calculate weighted overall score
  const overallScore = (
    angleAccuracy * (parameters.scoring.angle / 100) +
    distanceStability * (parameters.scoring.distance / 100) +
    speedConsistency * (parameters.scoring.speed / 100) +
    movementSmoothness * (parameters.scoring.smoothness / 100)
  )

  return {
    angleAccuracy,
    distanceStability,
    speedConsistency,
    movementSmoothness,
    overallScore
  }
}

/**
 * Apply Kalman filter to sensor data for noise reduction
 */
export const applyKalmanFilter = (
  measurements: number[],
  processNoise: number = 0.1,
  measurementNoise: number = 1.0
): number[] => {
  if (measurements.length === 0) return []

  const filtered: number[] = []
  let estimate = measurements[0]
  let error = 1.0

  for (const measurement of measurements) {
    // Prediction step
    const prediction = estimate
    const predictionError = error + processNoise

    // Update step
    const kalmanGain = predictionError / (predictionError + measurementNoise)
    estimate = prediction + kalmanGain * (measurement - prediction)
    error = (1 - kalmanGain) * predictionError

    filtered.push(estimate)
  }

  return filtered
}

/**
 * Detect welding technique based on movement patterns
 */
export const detectWeldingTechnique = (
  sensorData: SensorData[],
  markerData: ARMarkerData[]
): WeldingParameters['technique'] => {
  if (sensorData.length < 10) return 'MIG' // Default

  // Analyze movement patterns
  const accelerations = sensorData.map(s => calculateAccelerationMagnitude(s))
  const avgAcceleration = accelerations.reduce((sum, a) => sum + a, 0) / accelerations.length

  const distances = markerData.map(m => Math.abs(m.position.z))
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length

  // Simple classification based on movement characteristics
  if (avgDistance < 5) {
    return 'TIG' // TIG is typically done at very close distance
  } else if (avgAcceleration > 15) {
    return 'ELECTRODO' // Electrode has more erratic movement
  } else {
    return 'MIG' // Default to MIG
  }
}

/**
 * Calculate energy expenditure during welding
 */
export const calculateEnergyExpenditure = (
  sensorData: SensorData[],
  duration: number
): number => {
  if (sensorData.length === 0) return 0

  // Calculate total movement energy
  let totalEnergy = 0
  for (let i = 1; i < sensorData.length; i++) {
    const accel1 = calculateAccelerationMagnitude(sensorData[i - 1])
    const accel2 = calculateAccelerationMagnitude(sensorData[i])
    
    // Energy proportional to acceleration squared
    const deltaEnergy = Math.pow(accel2 - accel1, 2)
    totalEnergy += deltaEnergy
  }

  // Normalize by duration and return as relative measure
  return totalEnergy / duration
}

/**
 * Generate improvement suggestions based on metrics
 */
export const generateImprovementSuggestions = (metrics: WeldingMetrics): string[] => {
  const suggestions: string[] = []

  if (metrics.angleAccuracy < 70) {
    suggestions.push('Mantén el electrodo en el ángulo recomendado (60-80°)')
  }

  if (metrics.distanceStability < 70) {
    suggestions.push('Mantén una distancia constante del material base')
  }

  if (metrics.speedConsistency < 70) {
    suggestions.push('Practica movimientos más consistentes y uniformes')
  }

  if (metrics.movementSmoothness < 70) {
    suggestions.push('Reduce los movimientos bruscos y practica movimientos más suaves')
  }

  if (suggestions.length === 0) {
    suggestions.push('¡Excelente técnica! Sigue practicando para mantener este nivel.')
  }

  return suggestions
}