/**
 * Certificate generation and validation utilities
 */

import QRCode from 'qrcode'
import { CertificateData } from '../types'

export interface CertificateTemplate {
  backgroundColor: string
  borderColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  logoUrl?: string
}

/**
 * Generate a unique validation code for certificates
 */
export const generateValidationCode = (userName: string, technique: string, score: number): string => {
  const prefix = 'WELD'
  const userHash = simpleHash(userName).toString(36).substring(0, 4).toUpperCase()
  const techCode = getTechniqueCode(technique)
  const scoreCode = getScoreCode(score)
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
  
  return `${prefix}-${userHash}${techCode}${scoreCode}-${dateCode}-${randomCode}`
}

/**
 * Simple hash function for user identification
 */
const simpleHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get technique code for validation
 */
const getTechniqueCode = (technique: string): string => {
  const codes: Record<string, string> = {
    'MIG': 'M',
    'TIG': 'T',
    'ELECTRODO': 'E'
  }
  return codes[technique] || 'U' // U for Unknown
}

/**
 * Get score code for validation
 */
const getScoreCode = (score: number): string => {
  if (score >= 95) return 'A+' // Elite
  if (score >= 90) return 'A'  // Excellent
  if (score >= 80) return 'B'  // Good
  if (score >= 70) return 'C'  // Satisfactory
  if (score >= 60) return 'D'  // Needs Improvement
  return 'F'                   // Failed
}

/**
 * Validate a certificate code format
 */
export const validateCertificateCode = (code: string): boolean => {
  const pattern = /^WELD-[A-Z0-9]{6}-[0-9]{8}-[A-Z0-9]{4}$/
  return pattern.test(code)
}

/**
 * Extract information from validation code
 */
export const parseValidationCode = (code: string) => {
  if (!validateCertificateCode(code)) {
    return null
  }

  const parts = code.split('-')
  const userHash = parts[1].substring(0, 4)
  const techniqueCode = parts[1].charAt(4)
  const scoreCode = parts[1].substring(5, 7)
  const dateCode = parts[2]
  const randomCode = parts[3]

  const technique = getTechniqueFromCode(techniqueCode)
  const score = getScoreFromCode(scoreCode)
  const date = parseDateCode(dateCode)

  return {
    userHash,
    technique,
    scoreCode,
    score,
    date,
    randomCode,
    isValid: true
  }
}

/**
 * Get technique from code
 */
const getTechniqueFromCode = (code: string): string => {
  const techniques: Record<string, string> = {
    'M': 'MIG',
    'T': 'TIG',
    'E': 'ELECTRODO'
  }
  return techniques[code] || 'UNKNOWN'
}

/**
 * Get score from code
 */
const getScoreFromCode = (code: string): number => {
  const scoreRanges: Record<string, { min: number, max: number }> = {
    'A+': { min: 95, max: 100 },
    'A': { min: 90, max: 94 },
    'B': { min: 80, max: 89 },
    'C': { min: 70, max: 79 },
    'D': { min: 60, max: 69 },
    'F': { min: 0, max: 59 }
  }
  
  const range = scoreRanges[code]
  return range ? (range.min + range.max) / 2 : 0
}

/**
 * Parse date from date code
 */
const parseDateCode = (dateCode: string): Date => {
  const year = parseInt(dateCode.substring(0, 4))
  const month = parseInt(dateCode.substring(4, 6))
  const day = parseInt(dateCode.substring(6, 8))
  
  return new Date(year, month - 1, day)
}

/**
 * Generate QR code for certificate validation
 */
export const generateCertificateQR = async (validationCode: string): Promise<string> => {
  try {
    const validationUrl = `https://welding-simulator.app/validate?code=${validationCode}`
    
    return await QRCode.toDataURL(validationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Create certificate template configuration
 */
export const getCertificateTemplate = (style: 'professional' | 'modern' | 'classic'): CertificateTemplate => {
  const templates: Record<string, CertificateTemplate> = {
    professional: {
      backgroundColor: '#f8f9fa',
      borderColor: '#1976d2',
      textColor: '#212529',
      accentColor: '#28a745',
      fontFamily: 'Arial, sans-serif'
    },
    modern: {
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderColor: '#ffffff',
      textColor: '#ffffff',
      accentColor: '#ffd700',
      fontFamily: 'Helvetica, Arial, sans-serif'
    },
    classic: {
      backgroundColor: '#fffef7',
      borderColor: '#8b4513',
      textColor: '#2c3e50',
      accentColor: '#dc3545',
      fontFamily: 'Times New Roman, serif'
    }
  }
  
  return templates[style] || templates.professional
}

/**
 * Calculate certificate grade based on score
 */
export const calculateCertificateGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Get grade description
 */
export const getGradeDescription = (grade: string): string => {
  const descriptions: Record<string, string> = {
    'A': 'Excelente - Dominio completo de la técnica',
    'B': 'Bueno - Buen control de los parámetros',
    'C': 'Satisfactorio - Técnicas básicas competentes',
    'D': 'Mejorable - Requiere práctica adicional',
    'F': 'No competente - Requiere entrenamiento fundamental'
  }
  
  return descriptions[grade] || 'Sin calificación'
}

/**
 * Generate certificate PDF data
 */
export const generateCertificatePDFData = (certificate: CertificateData) => {
  return {
    title: `Certificado de Soldadura - ${certificate.technique}`,
    subject: `Certificación en técnica ${certificate.technique}`,
    author: 'Welding Simulator PWA',
    keywords: 'soldadura, certificación, técnica, MIG, TIG, electrodo',
    creator: 'Welding Simulator PWA',
    producer: 'MiniMax Agent',
    creationDate: new Date(certificate.date),
    modificationDate: new Date(),
    // Custom fields for validation
    customFields: {
      validationCode: certificate.validationCode,
      userName: certificate.userName,
      technique: certificate.technique,
      score: certificate.score,
      grade: certificate.grade,
      duration: certificate.duration
    }
  }
}

/**
 * Validate certificate authenticity
 */
export const validateCertificate = (code: string, expectedData?: Partial<CertificateData>): boolean => {
  const parsed = parseValidationCode(code)
  if (!parsed) return false

  // If expected data is provided, validate against it
  if (expectedData) {
    if (expectedData.technique && parsed.technique !== expectedData.technique) {
      return false
    }
    
    if (expectedData.score && Math.abs(parsed.score - expectedData.score) > 10) {
      return false
    }
    
    // Check if date is within reasonable range (not more than 1 year in the future)
    const now = new Date()
    const maxFutureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    if (parsed.date > maxFutureDate) {
      return false
    }
  }

  return true
}

/**
 * Generate certificate sharing data
 */
export const generateSharingData = (certificate: CertificateData) => {
  const shareText = `¡He completado exitosamente el curso de soldadura ${certificate.technique}! 
Puntuación: ${certificate.score}% 
Calificación: ${certificate.grade}
Código de validación: ${certificate.validationCode}

#Soldadura #Certificación #${certificate.technique}`

  const shareUrl = `https://welding-simulator.app/certificate/${certificate.validationCode}`

  return {
    title: `Certificado de Soldadura - ${certificate.userName}`,
    text: shareText,
    url: shareUrl
  }
}

/**
 * Check if certificate is expired
 */
export const isCertificateExpired = (certificateDate: number, expiryDays?: number): boolean => {
  const expiryPeriod = (expiryDays || 365) * 24 * 60 * 60 * 1000 // Default 1 year
  const now = Date.now()
  
  return (now - certificateDate) > expiryPeriod
}

/**
 * Generate certificate statistics for dashboard
 */
export const generateCertificateStats = (certificates: CertificateData[]) => {
  const stats = {
    total: certificates.length,
    byTechnique: {} as Record<string, number>,
    byGrade: {} as Record<string, number>,
    averageScore: 0,
    bestScore: 0,
    totalHours: 0
  }

  if (certificates.length === 0) return stats

  let totalScore = 0
  let bestScore = 0
  let totalHours = 0

  certificates.forEach(cert => {
    // Count by technique
    stats.byTechnique[cert.technique] = (stats.byTechnique[cert.technique] || 0) + 1
    
    // Count by grade
    stats.byGrade[cert.grade] = (stats.byGrade[cert.grade] || 0) + 1
    
    // Calculate totals
    totalScore += cert.score
    bestScore = Math.max(bestScore, cert.score)
    totalHours += cert.duration / (1000 * 60 * 60) // Convert to hours
  })

  stats.averageScore = totalScore / certificates.length
  stats.bestScore = bestScore
  stats.totalHours = totalHours

  return stats
}