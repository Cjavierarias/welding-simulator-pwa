import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  VolumeUp as VolumeIcon,
  Vibration as VibrationIcon
} from '@mui/icons-material'

// Hooks
import { useSensors } from '../../hooks/useSensors'
import { useCameraAR } from '../../hooks/useCameraAR'
import { useWeldingSimulation } from '../../hooks/useWeldingSimulation'
import { WeldingType } from '../../types'

const Simulator: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<WeldingType>('MIG')
  const [showResults, setShowResults] = useState(false)
  const [audioFeedback, setAudioFeedback] = useState(true)
  const [hapticFeedback, setHapticFeedback] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { sensorData, startSensors, stopSensors, getSensorStatus } = useSensors()
  const { videoRef, markers, startCamera, stopCamera, getCameraStatus } = useCameraAR()
  const { 
    currentTechnique, 
    isRecording, 
    currentMetrics, 
    startSession, 
    stopSession, 
    updateSession,
    getSimulationStatus 
  } = useWeldingSimulation()

  // Initialize sensors and camera on component mount
  useEffect(() => {
    startSensors()
    startCamera()

    return () => {
      stopSensors()
      stopCamera()
    }
  }, [])

  // Update session with new sensor and marker data
  useEffect(() => {
    if (isRecording && sensorData) {
      const latestMarker = markers.length > 0 ? markers[markers.length - 1] : null
      updateSession(sensorData, latestMarker)
    }
  }, [sensorData, markers, isRecording, updateSession])

  // Audio feedback
  useEffect(() => {
    if (audioFeedback && currentMetrics) {
      playAudioFeedback(currentMetrics)
    }
  }, [currentMetrics, audioFeedback])

  // Haptic feedback
  useEffect(() => {
    if (hapticFeedback && currentMetrics) {
      playHapticFeedback(currentMetrics)
    }
  }, [currentMetrics, hapticFeedback])

  const playAudioFeedback = useCallback((metrics: any) => {
    if ('AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (metrics.isInRange) {
        // Continuous tone when in ideal range
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        oscillator.start()
      } else {
        // Alert tone when out of range
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        oscillator.start()
        setTimeout(() => oscillator.stop(), 100)
      }
    }
  }, [])

  const playHapticFeedback = useCallback((metrics: any) => {
    if ('vibrate' in navigator) {
      if (metrics.isInRange) {
        // Short gentle vibration for good performance
        navigator.vibrate(50)
      } else {
        // Longer vibration for poor performance
        navigator.vibrate([100, 50, 100])
      }
    }
  }, [])

  const handleStartSession = () => {
    startSession(selectedTechnique)
  }

  const handleStopSession = () => {
    const session = stopSession()
    if (session) {
      setShowResults(true)
    }
  }

  const handleTechniqueChange = (technique: WeldingType) => {
    setSelectedTechnique(technique)
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bueno'
    if (score >= 40) return 'Regular'
    return 'Necesita Mejora'
  }

  const simulationStatus = getSimulationStatus()
  const sensorStatus = getSensorStatus()
  const cameraStatus = getCameraStatus()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Simulador de Soldadura
      </Typography>

      <Grid container spacing={3}>
        {/* Camera View */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Vista de Cámara AR</Typography>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={cameraStatus.isActive ? 'Cámara Activa' : 'Cámara Inactiva'}
                    color={cameraStatus.isActive ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip 
                    label={`${cameraStatus.markersCount} Marcadores`}
                    color="info"
                    size="small"
                  />
                </Box>
              </Box>

              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 400, 
                  backgroundColor: '#000',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  playsInline
                  muted
                />
                
                {/* AR Overlay */}
                {cameraStatus.isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 200,
                      height: 200,
                      border: '2px solid #00ff00',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 255, 0, 0.1)'
                    }}
                  >
                    <Typography variant="body2" color="success.main">
                      Área de Detección AR
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Control Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Panel de Control
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Técnica de Soldadura</InputLabel>
                <Select
                  value={selectedTechnique}
                  label="Técnica de Soldadura"
                  onChange={(e) => handleTechniqueChange(e.target.value as WeldingType)}
                  disabled={isRecording}
                >
                  <MenuItem value="MIG">MIG/MAG</MenuItem>
                  <MenuItem value="TIG">TIG</MenuItem>
                  <MenuItem value="ELECTRODO">Electrodo</MenuItem>
                </Select>
              </FormControl>

              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayIcon />}
                  onClick={handleStartSession}
                  disabled={isRecording || !sensorStatus.isActive || !cameraStatus.isActive}
                  fullWidth
                >
                  Iniciar Soldadura
                </Button>
                
                <IconButton
                  onClick={() => setSettingsOpen(true)}
                  color="primary"
                >
                  <SettingsIcon />
                </IconButton>
              </Box>

              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStopSession}
                  disabled={!isRecording}
                  fullWidth
                >
                  Detener
                </Button>
              </Box>

              {isRecording && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Grabando sesión... Tiempo: {Math.floor(simulationStatus.sessionDuration / 1000)}s
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas en Tiempo Real
              </Typography>

              {currentMetrics ? (
                <Box>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Ángulo</Typography>
                      <Typography variant="body2">{currentMetrics.currentAngle.toFixed(1)}°</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(currentMetrics.currentAngle, 100)} 
                      color={getQualityColor(currentMetrics.stabilityScore)}
                    />
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Distancia</Typography>
                      <Typography variant="body2">{currentMetrics.currentDistance.toFixed(1)}mm</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(currentMetrics.currentDistance * 5, 100)} 
                      color={getQualityColor(currentMetrics.stabilityScore)}
                    />
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Velocidad</Typography>
                      <Typography variant="body2">{currentMetrics.currentSpeed.toFixed(1)}mm/s</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(currentMetrics.currentSpeed * 5, 100)} 
                      color={getQualityColor(currentMetrics.stabilityScore)}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Puntuación de Calidad
                    </Typography>
                    <Chip 
                      label={`${currentMetrics.qualityScore.toFixed(0)}% - ${getQualityLabel(currentMetrics.qualityScore)}`}
                      color={getQualityColor(currentMetrics.qualityScore)}
                    />
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Inicia una sesión para ver las métricas en tiempo real
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status Indicators */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema
              </Typography>

              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={`Sensores: ${sensorStatus.isActive ? 'Activos' : 'Inactivos'}`}
                    color={sensorStatus.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={`Cámara: ${cameraStatus.isActive ? 'Activa' : 'Inactiva'}`}
                    color={cameraStatus.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={`Audio: ${audioFeedback ? 'Activado' : 'Desactivado'}`}
                    color={audioFeedback ? 'info' : 'default'}
                    size="small"
                  />
                  <IconButton 
                    size="small"
                    onClick={() => setAudioFeedback(!audioFeedback)}
                  >
                    <VolumeIcon />
                  </IconButton>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={`Haptico: ${hapticFeedback ? 'Activado' : 'Desactivado'}`}
                    color={hapticFeedback ? 'info' : 'default'}
                    size="small"
                  />
                  <IconButton 
                    size="small"
                    onClick={() => setHapticFeedback(!hapticFeedback)}
                  >
                    <VibrationIcon />
                  </IconButton>
                </Box>
              </Box>

              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => setShowResults(true)}
                disabled={!simulationStatus.currentSession}
                fullWidth
                sx={{ mt: 2 }}
              >
                Ver Resultados
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Configuración</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Ajusta los parámetros de retroalimentación y sensibilidad.
          </Typography>
          {/* Add more settings here as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resultados de la Sesión</DialogTitle>
        <DialogContent>
          {simulationStatus.currentSession && (
            <Box>
              <Typography variant="body1" paragraph>
                Sesión completada para técnica: {simulationStatus.currentSession.technique}
              </Typography>
              <Typography variant="body1" paragraph>
                Duración: {Math.floor(simulationStatus.currentSession.duration / 1000)} segundos
              </Typography>
              <Typography variant="body1" paragraph>
                Puntuación final: {simulationStatus.currentSession.finalScore.toFixed(1)}%
              </Typography>
              <Typography variant="body1" paragraph>
                Calificación: {simulationStatus.currentSession.grade}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>Cerrar</Button>
          <Button variant="contained" onClick={() => setShowResults(false)}>
            Generar Certificado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Simulator