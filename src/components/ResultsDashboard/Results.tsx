import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from 'chart.js'
import { Line, Radar } from 'react-chartjs-2'
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
)

interface SessionResult {
  id: string
  technique: string
  date: number
  duration: number
  score: number
  grade: string
  metrics: {
    angle: number
    distance: number
    speed: number
    stability: number
  }
}

const Results: React.FC = () => {
  const [sessions, setSessions] = useState<SessionResult[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionResult | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)

  // Mock data - in real app, this would come from IndexedDB or API
  useEffect(() => {
    const mockSessions: SessionResult[] = [
      {
        id: '1',
        technique: 'MIG',
        date: Date.now() - 86400000,
        duration: 300000,
        score: 85.5,
        grade: 'B',
        metrics: {
          angle: 82,
          distance: 78,
          speed: 90,
          stability: 85
        }
      },
      {
        id: '2',
        technique: 'TIG',
        date: Date.now() - 172800000,
        duration: 420000,
        score: 92.3,
        grade: 'A',
        metrics: {
          angle: 95,
          distance: 88,
          speed: 94,
          stability: 92
        }
      },
      {
        id: '3',
        technique: 'ELECTRODO',
        date: Date.now() - 259200000,
        duration: 180000,
        score: 78.2,
        grade: 'C',
        metrics: {
          angle: 75,
          distance: 82,
          speed: 76,
          stability: 80
        }
      }
    ]
    setSessions(mockSessions)
    if (mockSessions.length > 0) {
      setSelectedSession(mockSessions[0])
    }
  }, [])

  const filteredSessions = selectedTechnique === 'all' 
    ? sessions 
    : sessions.filter(s => s.technique === selectedTechnique)

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'success'
      case 'B': return 'primary'
      case 'C': return 'warning'
      case 'D': return 'error'
      default: return 'default'
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Chart data for time series
  const getTimeSeriesData = () => {
    const data = filteredSessions.map((session, index) => ({
      x: index,
      y: session.score
    }))

    return {
      labels: filteredSessions.map((_, index) => `Sesión ${index + 1}`),
      datasets: [
        {
          label: 'Puntuación',
          data: data.map(d => d.y),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }
      ]
    }
  }

  // Chart data for radar
  const getRadarData = () => {
    if (!selectedSession) return null

    return {
      labels: ['Ángulo', 'Distancia', 'Velocidad', 'Estabilidad'],
      datasets: [
        {
          label: selectedSession.technique,
          data: [
            selectedSession.metrics.angle,
            selectedSession.metrics.distance,
            selectedSession.metrics.speed,
            selectedSession.metrics.stability
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Progreso de Puntuaciones'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  }

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  }

  const handleExportResults = () => {
    // In a real app, this would generate a PDF or CSV
    const data = filteredSessions.map(session => ({
      Fecha: formatDate(session.date),
      Técnica: session.technique,
      Duración: formatDuration(session.duration),
      Puntuación: session.score,
      Calificación: session.grade
    }))
    
    console.log('Exporting results:', data)
    alert('Resultados exportados (funcionalidad pendiente de implementar)')
  }

  const handleShareResults = () => {
    if (navigator.share && selectedSession) {
      navigator.share({
        title: 'Resultados de Simulación de Soldadura',
        text: `Puntuación: ${selectedSession.score}% - Calificación: ${selectedSession.grade}`,
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      const text = `Resultados de Simulación de Soldadura\nPuntuación: ${selectedSession?.score}%\nCalificación: ${selectedSession?.grade}`
      navigator.clipboard.writeText(text).then(() => {
        alert('Resultados copiados al portapapeles')
      })
    }
  }

  const getStatistics = () => {
    if (filteredSessions.length === 0) return null

    const scores = filteredSessions.map(s => s.score)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const bestScore = Math.max(...scores)
    const totalTime = filteredSessions.reduce((sum, session) => sum + session.duration, 0)

    return {
      totalSessions: filteredSessions.length,
      avgScore: avgScore.toFixed(1),
      bestScore: bestScore.toFixed(1),
      totalTime: formatDuration(totalTime)
    }
  }

  const stats = getStatistics()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Panel de Resultados
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {stats && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {stats.totalSessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sesiones Totales
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {stats.avgScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Puntuación Promedio
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {stats.bestScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mejor Puntuación
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {stats.totalTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tiempo Total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Filter Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Filtros y Acciones</Typography>
                <Box display="flex" gap={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Técnica</InputLabel>
                    <Select
                      value={selectedTechnique}
                      label="Técnica"
                      onChange={(e) => setSelectedTechnique(e.target.value)}
                    >
                      <MenuItem value="all">Todas</MenuItem>
                      <MenuItem value="MIG">MIG</MenuItem>
                      <MenuItem value="TIG">TIG</MenuItem>
                      <MenuItem value="ELECTRODO">Electrodo</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportResults}
                  >
                    Exportar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShareResults}
                    disabled={!selectedSession}
                  >
                    Compartir
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progreso de Puntuaciones
              </Typography>
              {filteredSessions.length > 0 ? (
                <Line data={getTimeSeriesData()} options={chartOptions} />
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay datos para mostrar
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Radar Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas Detalladas
              </Typography>
              {selectedSession && getRadarData() ? (
                <Radar data={getRadarData()!} options={radarOptions} />
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Selecciona una sesión para ver las métricas
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Sesiones
              </Typography>
              
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Técnica</TableCell>
                      <TableCell>Duración</TableCell>
                      <TableCell>Puntuación</TableCell>
                      <TableCell>Calificación</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow 
                        key={session.id}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => {
                          setSelectedSession(session)
                          setShowDetails(true)
                        }}
                      >
                        <TableCell>{formatDate(session.date)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={session.technique}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDuration(session.duration)}</TableCell>
                        <TableCell>{session.score.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Chip 
                            label={session.grade}
                            size="small"
                            color={getGradeColor(session.grade)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSession(session)
                              setShowDetails(true)
                            }}
                          >
                            Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredSessions.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay sesiones registradas para los filtros seleccionados
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Session Details Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles de la Sesión - {selectedSession?.technique}
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Fecha</Typography>
                  <Typography variant="body1">{formatDate(selectedSession.date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Duración</Typography>
                  <Typography variant="body1">{formatDuration(selectedSession.duration)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Puntuación Final</Typography>
                  <Typography variant="body1">{selectedSession.score.toFixed(1)}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Calificación</Typography>
                  <Chip 
                    label={selectedSession.grade}
                    color={getGradeColor(selectedSession.grade)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Métricas Detalladas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Precisión de Ángulo</Typography>
                  <Typography variant="body1">{selectedSession.metrics.angle}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Estabilidad de Distancia</Typography>
                  <Typography variant="body1">{selectedSession.metrics.distance}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Consistencia de Velocidad</Typography>
                  <Typography variant="body1">{selectedSession.metrics.speed}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Suavidad del Movimiento</Typography>
                  <Typography variant="body1">{selectedSession.metrics.stability}%</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Cerrar</Button>
          <Button variant="contained" onClick={() => setShowDetails(false)}>
            Generar Certificado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Results