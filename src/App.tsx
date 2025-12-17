import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Box, Container, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'

// Components
import Calibration from './components/SensorCalibration/Calibration'
import Simulator from './components/WeldingSimulator/Simulator'
import Results from './components/ResultsDashboard/Results'
import Certificate from './components/CertificateGenerator/Certificate'

// Hooks
import { usePWA } from './hooks/usePWA'

const App: React.FC = () => {
  const [isCalibrated, setIsCalibrated] = useState(false)
  const { isStandalone } = usePWA()

  useEffect(() => {
    // Check if device is already calibrated
    const calibrationStatus = localStorage.getItem('welding-sim-calibrated')
    if (calibrationStatus === 'true') {
      setIsCalibrated(true)
    }
  }, [])

  const handleCalibrationComplete = () => {
    setIsCalibrated(true)
    localStorage.setItem('welding-sim-calibrated', 'true')
  }

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welding Simulator PWA
            </Typography>
            <IconButton color="inherit" component="a" href="/">
              <HomeIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route 
              path="/" 
              element={
                isCalibrated ? <Navigate to="/simulator" /> : <Calibration onComplete={handleCalibrationComplete} />
              } 
            />
            <Route 
              path="/simulator" 
              element={
                isCalibrated ? <Simulator /> : <Navigate to="/" />
              } 
            />
            <Route 
              path="/results" 
              element={<Results />} 
            />
            <Route 
              path="/certificate" 
              element={<Certificate />} 
            />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App