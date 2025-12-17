/**
 * IndexedDB service for local data storage
 */

import { openDB, IDBPDatabase } from 'idb'
import { WeldingSession, UserProfile, CertificateData } from '../types'

const DB_NAME = 'WeldingSimulatorDB'
const DB_VERSION = 1

export interface StoredSession extends WeldingSession {
  synced: boolean
}

export interface StoredProfile extends UserProfile {
  lastSync: number
}

export interface StoredCertificate extends CertificateData {
  synced: boolean
}

class DatabaseService {
  private db: IDBPDatabase | null = null
  private isInitialized = false

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionStore = db.createObjectStore('sessions', { 
              keyPath: 'id',
              autoIncrement: false 
            })
            sessionStore.createIndex('technique', 'technique', { unique: false })
            sessionStore.createIndex('startTime', 'startTime', { unique: false })
            sessionStore.createIndex('finalScore', 'finalScore', { unique: false })
            sessionStore.createIndex('synced', 'synced', { unique: false })
          }

          // User profile store
          if (!db.objectStoreNames.contains('profile')) {
            db.createObjectStore('profile', { keyPath: 'id' })
          }

          // Certificates store
          if (!db.objectStoreNames.contains('certificates')) {
            const certStore = db.createObjectStore('certificates', {
              keyPath: 'id',
              autoIncrement: false
            })
            certStore.createIndex('userName', 'userName', { unique: false })
            certStore.createIndex('technique', 'technique', { unique: false })
            certStore.createIndex('validationCode', 'validationCode', { unique: true })
            certStore.createIndex('synced', 'synced', { unique: false })
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
        }
      })

      this.isInitialized = true
      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw new Error('Database initialization failed')
    }
  }

  /**
   * Save a welding session
   */
  async saveSession(session: WeldingSession): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    const storedSession: StoredSession = {
      ...session,
      synced: false
    }

    try {
      await this.db.put('sessions', storedSession)
      console.log('Session saved:', session.id)
    } catch (error) {
      console.error('Failed to save session:', error)
      throw new Error('Failed to save session')
    }
  }

  /**
   * Get all sessions
   */
  async getSessions(limit?: number): Promise<StoredSession[]> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      let sessions = await this.db.getAll('sessions')
      
      // Sort by start time (newest first)
      sessions.sort((a, b) => b.startTime - a.startTime)
      
      if (limit) {
        sessions = sessions.slice(0, limit)
      }
      
      return sessions
    } catch (error) {
      console.error('Failed to get sessions:', error)
      return []
    }
  }

  /**
   * Get sessions by technique
   */
  async getSessionsByTechnique(technique: string): Promise<StoredSession[]> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const sessions = await this.db.getAllFromIndex('sessions', 'technique', technique)
      sessions.sort((a, b) => b.startTime - a.startTime)
      return sessions
    } catch (error) {
      console.error('Failed to get sessions by technique:', error)
      return []
    }
  }

  /**
   * Get sessions by date range
   */
  async getSessionsByDateRange(startDate: number, endDate: number): Promise<StoredSession[]> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const allSessions = await this.db.getAll('sessions')
      return allSessions.filter(session => 
        session.startTime >= startDate && session.startTime <= endDate
      ).sort((a, b) => b.startTime - a.startTime)
    } catch (error) {
      console.error('Failed to get sessions by date range:', error)
      return []
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.delete('sessions', sessionId)
      console.log('Session deleted:', sessionId)
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw new Error('Failed to delete session')
    }
  }

  /**
   * Save user profile
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    const storedProfile: StoredProfile = {
      ...profile,
      lastSync: Date.now()
    }

    try {
      await this.db.put('profile', storedProfile)
      console.log('Profile saved')
    } catch (error) {
      console.error('Failed to save profile:', error)
      throw new Error('Failed to save profile')
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<StoredProfile | null> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const profiles = await this.db.getAll('profile')
      return profiles.length > 0 ? profiles[0] : null
    } catch (error) {
      console.error('Failed to get profile:', error)
      return null
    }
  }

  /**
   * Save certificate
   */
  async saveCertificate(certificate: CertificateData): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    const storedCertificate: StoredCertificate = {
      ...certificate,
      synced: false
    }

    try {
      await this.db.put('certificates', storedCertificate)
      console.log('Certificate saved:', certificate.id)
    } catch (error) {
      console.error('Failed to save certificate:', error)
      throw new Error('Failed to save certificate')
    }
  }

  /**
   * Get certificate by validation code
   */
  async getCertificateByValidationCode(validationCode: string): Promise<StoredCertificate | null> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const certificates = await this.db.getAllFromIndex('certificates', 'validationCode', validationCode)
      return certificates.length > 0 ? certificates[0] : null
    } catch (error) {
      console.error('Failed to get certificate by validation code:', error)
      return null
    }
  }

  /**
   * Get all certificates
   */
  async getCertificates(limit?: number): Promise<StoredCertificate[]> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      let certificates = await this.db.getAll('certificates')
      certificates.sort((a, b) => b.date - a.date)
      
      if (limit) {
        certificates = certificates.slice(0, limit)
      }
      
      return certificates
    } catch (error) {
      console.error('Failed to get certificates:', error)
      return []
    }
  }

  /**
   * Delete certificate
   */
  async deleteCertificate(certificateId: string): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.delete('certificates', certificateId)
      console.log('Certificate deleted:', certificateId)
    } catch (error) {
      console.error('Failed to delete certificate:', error)
      throw new Error('Failed to delete certificate')
    }
  }

  /**
   * Save application setting
   */
  async saveSetting(key: string, value: any): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.put('settings', { key, value })
    } catch (error) {
      console.error('Failed to save setting:', error)
      throw new Error('Failed to save setting')
    }
  }

  /**
   * Get application setting
   */
  async getSetting(key: string): Promise<any> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const result = await this.db.get('settings', key)
      return result ? result.value : null
    } catch (error) {
      console.error('Failed to get setting:', error)
      return null
    }
  }

  /**
   * Get all unsynced data for backup/sync
   */
  async getUnsyncedData(): Promise<{
    sessions: StoredSession[]
    certificates: StoredCertificate[]
  }> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const unsyncedSessions = await this.db.getAllFromIndex('sessions', 'synced', false)
      const unsyncedCertificates = await this.db.getAllFromIndex('certificates', 'synced', false)
      
      return {
        sessions: unsyncedSessions,
        certificates: unsyncedCertificates
      }
    } catch (error) {
      console.error('Failed to get unsynced data:', error)
      return { sessions: [], certificates: [] }
    }
  }

  /**
   * Mark data as synced
   */
  async markAsSynced(storeName: 'sessions' | 'certificates', ids: string[]): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const tx = this.db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)

      for (const id of ids) {
        const item = await store.get(id)
        if (item) {
          item.synced = true
          await store.put(item)
        }
      }

      await tx.done
    } catch (error) {
      console.error('Failed to mark as synced:', error)
      throw new Error('Failed to mark data as synced')
    }
  }

  /**
   * Clear all data (for reset/cleanup)
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const tx = this.db.transaction(['sessions', 'certificates', 'profile', 'settings'], 'readwrite')
      
      await Promise.all([
        tx.objectStore('sessions').clear(),
        tx.objectStore('certificates').clear(),
        tx.objectStore('profile').clear(),
        tx.objectStore('settings').clear()
      ])

      await tx.done
      console.log('All data cleared')
    } catch (error) {
      console.error('Failed to clear data:', error)
      throw new Error('Failed to clear data')
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<{
    totalSessions: number
    totalCertificates: number
    storageUsed: number
    oldestSession: number | null
    newestSession: number | null
  }> {
    await this.ensureInitialized()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const sessions = await this.db.getAll('sessions')
      const certificates = await this.db.getAll('certificates')

      const oldestSession = sessions.length > 0 
        ? Math.min(...sessions.map(s => s.startTime))
        : null
        
      const newestSession = sessions.length > 0 
        ? Math.max(...sessions.map(s => s.startTime))
        : null

      return {
        totalSessions: sessions.length,
        totalCertificates: certificates.length,
        storageUsed: this.estimateStorageSize(),
        oldestSession,
        newestSession
      }
    } catch (error) {
      console.error('Failed to get statistics:', error)
      return {
        totalSessions: 0,
        totalCertificates: 0,
        storageUsed: 0,
        oldestSession: null,
        newestSession: null
      }
    }
  }

  /**
   * Estimate storage size (approximate)
   */
  private estimateStorageSize(): number {
    // This is a rough estimate - in a real app you'd measure actual storage
    return 1024 * 1024 // 1MB placeholder
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init()
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()