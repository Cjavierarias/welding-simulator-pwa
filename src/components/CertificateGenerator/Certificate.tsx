import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip
} from '@mui/material'
import {
  PictureAsPdf as PdfIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface CertificateData {
  id: string
  userName: string
  technique: string
  score: number
  grade: string
  duration: number
  date: number
  validationCode: string
}

const CertificateGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    technique: 'MIG',
    score: 0,
    grade: 'A',
    duration: 0,
    date: Date.now()
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCertificate, setGeneratedCertificate] = useState<CertificateData | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const certificateRef = useRef<HTMLDivElement>(null)

  const techniques = ['MIG', 'TIG', 'ELECTRODO']
  const grades = ['A', 'B', 'C', 'D', 'F']

  useEffect(() => {
    if (generatedCertificate) {
      generateQRCode(generatedCertificate.validationCode)
    }
  }, [generatedCertificate])

  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 100,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const generateValidationCode = (): string => {
    const prefix = 'WELD'
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `${prefix}-${randomPart}-${datePart}`
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    return formData.userName.trim().length > 0 && 
           formData.score >= 0 && 
           formData.score <= 100 &&
           formData.duration > 0
  }

  const generateCertificate = async () => {
    if (!validateForm()) return

    setIsGenerating(true)

    try {
      const certificate: CertificateData = {
        id: `cert_${Date.now()}`,
        userName: formData.userName,
        technique: formData.technique,
        score: formData.score,
        grade: formData.grade,
        duration: formData.duration,
        date: formData.date,
        validationCode: generateValidationCode()
      }

      setGeneratedCertificate(certificate)
    } catch (error) {
      console.error('Error generating certificate:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCertificateAsPDF = async () => {
    if (!certificateRef.current) return

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgWidth = 297 // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Certificado_Soldadura_${generatedCertificate?.userName}_${generatedCertificate?.technique}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const shareCertificate = async () => {
    if (!generatedCertificate) return

    try {
      // Generate image data URL
      const canvas = await html2canvas(certificateRef.current!, {
        scale: 1,
        useCORS: true,
        allowTaint: true
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'certificado.png', { type: 'image/png' })
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Certificado de Soldadura',
              text: `Certificado de ${generatedCertificate.userName} - ${generatedCertificate.technique}`,
              files: [file]
            })
          }
        } else {
          // Fallback - download image
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `Certificado_${generatedCertificate.userName}_${generatedCertificate.technique}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      })
    } catch (error) {
      console.error('Error sharing certificate:', error)
    }
  }

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'success'
      case 'B': return 'primary'
      case 'C': return 'warning'
      case 'D': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Generador de Certificados
      </Typography>

      <Grid container spacing={3}>
        {/* Certificate Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información del Certificado
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre del Estudiante"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Técnica de Soldadura"
                    value={formData.technique}
                    onChange={(e) => handleInputChange('technique', e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    variant="outlined"
                  >
                    {techniques.map((tech) => (
                      <option key={tech} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Puntuación (%)"
                    type="number"
                    value={formData.score}
                    onChange={(e) => handleInputChange('score', Number(e.target.value))}
                    inputProps={{ min: 0, max: 100 }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Calificación"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    variant="outlined"
                  >
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duración (minutos)"
                    type="number"
                    value={formData.duration / 60000}
                    onChange={(e) => handleInputChange('duration', Number(e.target.value) * 60000)}
                    inputProps={{ min: 1 }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={generateCertificate}
                    disabled={!validateForm() || isGenerating}
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    {isGenerating ? 'Generando...' : 'Generar Certificado'}
                  </Button>
                </Grid>

                {formData.userName && formData.score > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Vista previa del certificado basada en los datos ingresados
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Certificate Preview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vista Previa
              </Typography>

              {generatedCertificate ? (
                <Box>
                  {/* Certificate Template */}
                  <Box
                    ref={certificateRef}
                    sx={{
                      width: '100%',
                      maxWidth: 600,
                      height: 400,
                      backgroundColor: '#f8f9fa',
                      border: '2px solid #1976d2',
                      borderRadius: 2,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                    }}
                  >
                    {/* Header */}
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        CERTIFICADO
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        de Competencia en Soldadura
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box textAlign="center" flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                      <Typography variant="h5" fontWeight="bold" mb={2}>
                        {generatedCertificate.userName}
                      </Typography>
                      
                      <Typography variant="body1" mb={2}>
                        ha completado satisfactoriamente el curso de
                      </Typography>
                      
                      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
                        TÉCNICA DE SOLDADURA {generatedCertificate.technique}
                      </Typography>

                      <Box display="flex" justifyContent="space-around" my={2}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="success.main" fontWeight="bold">
                            {generatedCertificate.score}%
                          </Typography>
                          <Typography variant="caption">Puntuación</Typography>
                        </Box>
                        <Box textAlign="center">
                          <Chip 
                            label={generatedCertificate.grade}
                            color={getGradeColor(generatedCertificate.grade)}
                            size="large"
                          />
                          <Typography variant="caption" display="block">Calificación</Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2">
                        Duración: {formatDuration(generatedCertificate.duration)}
                      </Typography>
                    </Box>

                    {/* Footer */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption">
                        {new Date(generatedCertificate.date).toLocaleDateString('es-ES')}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption">Validación:</Typography>
                        {qrCodeUrl && (
                          <img src={qrCodeUrl} alt="QR Code" width={30} height={30} />
                        )}
                        <Typography variant="caption" fontWeight="bold">
                          {generatedCertificate.validationCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadCertificateAsPDF}
                      size="small"
                    >
                      Descargar PDF
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={shareCertificate}
                      size="small"
                    >
                      Compartir
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    backgroundColor: '#f5f5f5',
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Completa el formulario para generar el certificado
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Validation Dialog */}
      <Dialog open={false} maxWidth="sm" fullWidth>
        <DialogTitle>Validar Certificado</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Introduce el código de validación para verificar la autenticidad del certificado.
          </Typography>
          <TextField
            fullWidth
            label="Código de Validación"
            placeholder="WELD-XXXXXX-YYYYMMDD"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>Cancelar</Button>
          <Button variant="contained" onClick={() => {}}>
            Validar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CertificateGenerator