// Welding Technique Types
export type WeldingType = 'MIG' | 'TIG' | 'ELECTRODO'

// Sensor Data Types
export interface SensorData {
  acceleration: {
    x: number
    y: number
    z: number
  }
  gyroscope: {
    alpha: number // rotation around z-axis
    beta: number  // rotation around x-axis
    gamma: number // rotation around y-axis
  }
  magnetometer?: {
    x: number
    y: number
    z: number
  }
  timestamp: number
}

// AR Marker Data
export interface ARMarkerData {
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    pitch: number
    yaw: number
    roll: number
  }
  size: number // marker size in pixels
  confidence: number // detection confidence 0-1
  timestamp: number
}

// Welding Parameters
export interface WeldingParameters {
  technique: WeldingType
  idealAngle: {
    min: number
    max: number
  }
  idealDistance: {
    min: number
    max: number
  }
  idealSpeed: {
    min: number
    max: number
  }
  scoring: {
    angle: number // weight for angle accuracy
    distance: number // weight for distance stability
    speed: number // weight for speed consistency
    smoothness: number // weight for movement smoothness
  }
}

// Real-time Metrics
export interface RealTimeMetrics {
  currentAngle: number
  currentDistance: number
  currentSpeed: number
  stabilityScore: number
  qualityScore: number
  isInRange: boolean
  timestamp: number
}

// Session Data
export interface WeldingSession {
  id: string
  technique: WeldingType
  startTime: number
  endTime?: number
  duration: number
  parameters: WeldingParameters
  sensorData: SensorData[]
  markerData: ARMarkerData[]
  metrics: RealTimeMetrics[]
  finalScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  userName?: string
}

// User Profile
export interface UserProfile {
  id: string
  name: string
  email?: string
  preferredTechnique: WeldingType
  totalSessions: number
  bestScores: Record<WeldingType, number>
  createdAt: number
  updatedAt: number
}

// Certificate Data
export interface CertificateData {
  id: string
  userName: string
  technique: WeldingType
  score: number
  grade: string
  duration: number
  date: number
  sessionId: string
  validationCode: string
}

// API Response Types
export interface GoogleSheetsResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Calibration Settings
export interface CalibrationSettings {
  sensorSensitivity: number
  markerSize: number // in mm
  cameraResolution: {
    width: number
    height: number
  }
  audioFeedback: boolean
  hapticFeedback: boolean
  vibrationIntensity: number
}

// App State
export interface AppState {
  isInitialized: boolean
  isCalibrated: boolean
  currentSession: WeldingSession | null
  userProfile: UserProfile | null
  settings: CalibrationSettings
  isRecording: boolean
  currentMetrics: RealTimeMetrics | null
}

// Error Types
export interface AppError {
  code: string
  message: string
  timestamp: number
  context?: string
}

// Permission Types
export type PermissionType = 'camera' | 'motion' | 'orientation' | 'notification'

export interface PermissionState {
  camera: 'granted' | 'denied' | 'prompt'
  motion: 'granted' | 'denied' | 'prompt'
  orientation: 'granted' | 'denied' | 'prompt'
  notification: 'granted' | 'denied' | 'prompt'
}

// Chart Data Types
export interface ChartDataPoint {
  x: number
  y: number
  timestamp: number
}

export interface RadarChartData {
  angle: number
  distance: number
  speed: number
  stability: number
  smoothness: number
}