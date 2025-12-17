import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CameraAlt as CameraIcon,
  Sensors as SensorsIcon,
  Tune as TuneIcon
} from '@mui/icons-material'

// Hooks
import { useSensors } from '../../hooks/useSensors'
import { useCameraAR } from '../../hooks/useCameraAR'

interface CalibrationProps {
  onComplete: () => void
}

const steps = [
  'Permisos de Cámara',
  'Permisos de Sensores',
  'Configuración AR',
  'Calibración Final'
]

const Calibration: React.FC<CalibrationProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [calibrationData, setCalibrationData] = useState({
    camera: false,
    sensors: false,
    ar: false,
    settings: false
  })

  const { 
    requestPermissions, 
    getSensorStatus, 
    sensorData,
    permissions 
  } = useSensors()

  const { 
    startCamera, 
    stopCamera, 
    getCameraStatus,
    isActive: cameraActive 
  } = useCameraAR()

  // Check calibration status
  useEffect(() => {
    const checkCalibration = () => {
      const cameraStatus = getCameraStatus()
      const sensorStatus = getSensorStatus()
      
      setCalibrationData({
        camera: cameraStatus.isActive && !cameraStatus.hasError,
        sensors: permissions.motion === 'granted' && permissions.orientation === 'granted',
        ar: cameraStatus.markersCount > 0,
        settings: true // Settings are always available
      })
    }

    const interval = setInterval(checkCalibration, 1000)
    return () => clearInterval(interval)
  }, [getCameraStatus, getSensorStatus, permissions])

  // Auto-advance steps when completed
  useEffect(() => {
    if (calibrationData.camera && activeStep === 0) {
      setActiveStep(1)
    }
    if (calibrationData.sensors && activeStep === 1) {
      setActiveStep(2)
    }
    if (calibrationData.ar && activeStep === 2) {
      setActiveStep(3)
    }
    if (calibrationData.settings && activeStep === 3) {
      setIsCompleted(true)
    }
  }, [calibrationData, activeStep])

  const handleStepClick = (step: number) => {
    setActiveStep(step)
  }

  const handleRequestCamera = async () => {
    await startCamera()
  }

  const handleRequestSensors = async () => {
    await requestPermissions()
  }

  const handleCompleteCalibration = () => {
    // Save calibration data
    localStorage.setItem('welding-sim-calibration', JSON.stringify({
      timestamp: Date.now(),
      data: calibrationData
    }))
    onComplete()
  }

  const getStepIcon = (step: number) => {
    const completed = activeStep > step || (step === 0 && calibrationData.camera) ||
                     (step === 1 && calibrationData.sensors) ||
                     (step === 2 && calibrationData.ar) ||
                     (step === 3 && calibrationData.settings)

    if (completed) return <CheckIcon color="success" />
    if (activeStep === step) return <CircularProgress size={24} />
    return null
  }

  const getStepStatus = (step: number) => {
    switch (step) {
      case 0:
        return calibrationData.camera ? 'success' : 'warning'
      case 1:
        return calibrationData.sensors ? 'success' : 'warning'
      case 2:
        return calibrationData.ar ? 'success' : 'warning'
      case 3:
        return calibrationData.settings ? 'success' : 'info'
      default:
        return 'info'
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración de Cámara
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              La cámara se utiliza para el seguimiento AR de patrones de soldadura.
            </Typography>
            
            {cameraActive ? (
              <Alert severity="success" icon={<CheckIcon />}>
                Cámara activa y funcionando
              </Alert>
            ) : (
              <Button
                variant="contained"
                onClick={handleRequestCamera}
                startIcon={<CameraIcon />}
                size="large"
              >
                Activar Cámara
              </Button>
            )}

            {sensorData && (
              <Box mt={2}>
                <Typography variant="subtitle2">Datos de Sensores Activos:</Typography>
                <Typography variant="body2" color="text.secondary">
                  Acelerómetro: ({sensorData.acceleration.x.toFixed(2)}, {sensorData.acceleration.y.toFixed(2)}, {sensorData.acceleration.z.toFixed(2)})
                </Typography>
              </Box>
            )}
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Permisos de Sensores
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Los sensores del dispositivo se utilizan para detectar movimientos y rotaciones.
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  {permissions.motion === 'granted' ? <CheckIcon color="success" /> : 
                   permissions.motion === 'denied' ? <ErrorIcon color="error" /> :
                   <WarningIcon color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Sensor de Movimiento" 
                  secondary={permissions.motion === 'granted' ? 'Concedido' : 
                            permissions.motion === 'denied' ? 'Denegado' : 'Pendiente'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {permissions.orientation === 'granted' ? <CheckIcon color="success" /> : 
                   permissions.orientation === 'denied' ? <ErrorIcon color="error" /> :
                   <WarningIcon color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Sensor de Orientación" 
                  secondary={permissions.orientation === 'granted' ? 'Concedido' : 
                            permissions.orientation === 'denied' ? 'Denegado' : 'Pendiente'}
                />
              </ListItem>
            </List>

            {(permissions.motion !== 'granted' || permissions.orientation !== 'granted') && (
              <Button
                variant="contained"
                onClick={handleRequestSensors}
                startIcon={<SensorsIcon />}
                size="large"
              >
                Solicitar Permisos de Sensores
              </Button>
            )}
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración AR
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Asegúrate de tener el patrón AR visible en la cámara para la calibración.
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              <Chip 
                label={`Cámara: ${cameraActive ? 'Activa' : 'Inactiva'}`}
                color={cameraActive ? 'success' : 'default'}
                variant="outlined"
              />
              <Chip 
                label={`Sensores: ${permissions.motion === 'granted' ? 'Listos' : 'Pendientes'}`}
                color={permissions.motion === 'granted' ? 'success' : 'warning'}
                variant="outlined"
              />
            </Box>

            {cameraActive && (
              <Alert severity="info">
                <Typography variant="body2">
                  Coloca el patrón AR en el campo de visión de la cámara. 
                  El sistema detectará automáticamente el patrón.
                </Typography>
              </Alert>
            )}

            <Box mt={2}>
              <video
                ref={/* @ts-ignore */ useCameraAR().videoRef}
                style={{ 
                  width: '100%', 
                  maxWidth: '400px', 
                  borderRadius: '8px',
                  backgroundColor: '#000'
                }}
                playsInline
                muted
              />
            </Box>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración Final
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Revisa la configuración y ajusta los parámetros según sea necesario.
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon><TuneIcon /></ListItemIcon>
                <ListItemText 
                  primary="Configuración Guardada"
                  secondary="Todos los parámetros han sido calibrados correctamente"
                />
              </ListItem>
            </List>

            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                ¡Calibración completada! Tu dispositivo está listo para la simulación de soldadura.
              </Typography>
            </Alert>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Calibración del Simulador
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Sigue estos pasos para configurar tu dispositivo para la simulación de soldadura
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
              <StepLabel 
                StepIconComponent={() => getStepIcon(index)}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 300 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            Anterior
          </Button>
          
          <Button
            variant="contained"
            onClick={handleCompleteCalibration}
            disabled={!isCompleted}
            size="large"
          >
            {isCompleted ? 'Finalizar Calibración' : 'Siguiente'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default Calibration