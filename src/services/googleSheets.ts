/**
 * Google Sheets integration service
 * This service handles communication with Google Sheets via Apps Script Web App
 */

import { WeldingSession, CertificateData, UserProfile } from '../types'

const GOOGLE_SHEETS_API_BASE = 'https://script.google.com/macros/s/AKfycbzP6E7CkcBIUnZTbqPl9NKmzjvfkucDAmh0fnjCbFsnz35U7wz6p_RrAdb24QJYnALF/exec'

export interface SheetsConfig {
  spreadsheetId: string
  sheetName: string
  apiKey?: string
}

export interface SheetsResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class GoogleSheetsService {
  private config: SheetsConfig | null = null

  /**
   * Initialize Google Sheets service
   */
  init(config: SheetsConfig): void {
    this.config = config
    console.log('Google Sheets service initialized')
  }

  /**
   * Save welding session to Google Sheets
   */
  async saveSession(session: WeldingSession): Promise<SheetsResponse<{ rowId: string }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const sessionData = this.formatSessionForSheets(session)
      const response = await this.makeRequest('POST', '/saveSession', sessionData)
      return response
    } catch (error) {
      console.error('Failed to save session to sheets:', error)
      return { success: false, error: 'Failed to save session' }
    }
  }

  /**
   * Save certificate to Google Sheets
   */
  async saveCertificate(certificate: CertificateData): Promise<SheetsResponse<{ rowId: string }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const certificateData = this.formatCertificateForSheets(certificate)
      const response = await this.makeRequest('POST', '/saveCertificate', certificateData)
      return response
    } catch (error) {
      console.error('Failed to save certificate to sheets:', error)
      return { success: false, error: 'Failed to save certificate' }
    }
  }

  /**
   * Save user profile to Google Sheets
   */
  async saveProfile(profile: UserProfile): Promise<SheetsResponse<{ rowId: string }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const profileData = this.formatProfileForSheets(profile)
      const response = await this.makeRequest('POST', '/saveProfile', profileData)
      return response
    } catch (error) {
      console.error('Failed to save profile to sheets:', error)
      return { success: false, error: 'Failed to save profile' }
    }
  }

  /**
   * Get user statistics from Google Sheets
   */
  async getUserStatistics(userId: string): Promise<SheetsResponse<{
    totalSessions: number
    bestScores: Record<string, number>
    averageScore: number
    totalTime: number
    techniques: string[]
  }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const response = await this.makeRequest('GET', `/getUserStatistics?userId=${userId}`)
      return response
    } catch (error) {
      console.error('Failed to get user statistics:', error)
      return { success: false, error: 'Failed to get user statistics' }
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(technique?: string, limit: number = 50): Promise<SheetsResponse<Array<{
    userName: string
    technique: string
    score: number
    date: string
    validationCode?: string
  }>>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const url = technique 
        ? `/getLeaderboard?technique=${technique}&limit=${limit}`
        : `/getLeaderboard?limit=${limit}`
      const response = await this.makeRequest('GET', url)
      return response
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return { success: false, error: 'Failed to get leaderboard' }
    }
  }

  /**
   * Validate certificate
   */
  async validateCertificate(validationCode: string): Promise<SheetsResponse<CertificateData | null>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const response = await this.makeRequest('GET', `/validateCertificate?code=${validationCode}`)
      return response
    } catch (error) {
      console.error('Failed to validate certificate:', error)
      return { success: false, error: 'Failed to validate certificate' }
    }
  }

  /**
   * Batch save multiple sessions
   */
  async saveSessionsBatch(sessions: WeldingSession[]): Promise<SheetsResponse<{ saved: number, errors: string[] }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const sessionsData = sessions.map(session => this.formatSessionForSheets(session))
      const response = await this.makeRequest('POST', '/saveSessionsBatch', { sessions: sessionsData })
      return response
    } catch (error) {
      console.error('Failed to save sessions batch:', error)
      return { success: false, error: 'Failed to save sessions batch' }
    }
  }

  /**
   * Export user data (for GDPR compliance)
   */
  async exportUserData(userId: string): Promise<SheetsResponse<{
    profile: UserProfile
    sessions: WeldingSession[]
    certificates: CertificateData[]
  }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const response = await this.makeRequest('GET', `/exportUserData?userId=${userId}`)
      return response
    } catch (error) {
      console.error('Failed to export user data:', error)
      return { success: false, error: 'Failed to export user data' }
    }
  }

  /**
   * Delete user data (for GDPR compliance)
   */
  async deleteUserData(userId: string): Promise<SheetsResponse<{ deleted: boolean }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const response = await this.makeRequest('DELETE', `/deleteUserData?userId=${userId}`)
      return response
    } catch (error) {
      console.error('Failed to delete user data:', error)
      return { success: false, error: 'Failed to delete user data' }
    }
  }

  /**
   * Format session data for Google Sheets
   */
  private formatSessionForSheets(session: WeldingSession) {
    return {
      id: session.id,
      userId: session.userId || 'anonymous',
      userName: session.userName || 'Anonymous',
      technique: session.technique,
      startTime: new Date(session.startTime).toISOString(),
      endTime: session.endTime ? new Date(session.endTime).toISOString() : '',
      duration: session.duration,
      finalScore: session.finalScore,
      grade: session.grade,
      avgAngleAccuracy: this.calculateAverage(session.metrics, 'angle'),
      avgDistanceStability: this.calculateAverage(session.metrics, 'distance'),
      avgSpeedConsistency: this.calculateAverage(session.metrics, 'speed'),
      avgSmoothness: this.calculateAverage(session.metrics, 'smoothness'),
      totalDataPoints: session.sensorData.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Format certificate data for Google Sheets
   */
  private formatCertificateForSheets(certificate: CertificateData) {
    return {
      id: certificate.id,
      userName: certificate.userName,
      technique: certificate.technique,
      score: certificate.score,
      grade: certificate.grade,
      duration: certificate.duration,
      date: new Date(certificate.date).toISOString(),
      validationCode: certificate.validationCode,
      sessionId: certificate.sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Format profile data for Google Sheets
   */
  private formatProfileForSheets(profile: UserProfile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      preferredTechnique: profile.preferredTechnique,
      totalSessions: profile.totalSessions,
      bestScores: JSON.stringify(profile.bestScores),
      createdAt: new Date(profile.createdAt).toISOString(),
      updatedAt: new Date(profile.updatedAt).toISOString()
    }
  }

  /**
   * Calculate average from metrics array
   */
  private calculateAverage(metrics: any[], field: string): number {
    if (metrics.length === 0) return 0
    const sum = metrics.reduce((acc, metric) => acc + (metric[field] || 0), 0)
    return Math.round((sum / metrics.length) * 100) / 100
  }

  /**
   * Make HTTP request to Google Apps Script Web App
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<SheetsResponse<any>> {
    const url = `${GOOGLE_SHEETS_API_BASE}${endpoint}`
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: result.success || false,
        data: result.data,
        error: result.error,
        message: result.message
      }
    } catch (error) {
      console.error('Request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection(): Promise<SheetsResponse<{ message: string, timestamp: string }>> {
    if (!this.config) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const response = await this.makeRequest('GET', '/test')
      return response
    } catch (error) {
      console.error('Connection test failed:', error)
      return { success: false, error: 'Connection test failed' }
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService()

// Helper function to initialize with configuration
export const initializeGoogleSheets = (config: SheetsConfig) => {
  googleSheetsService.init(config)
}