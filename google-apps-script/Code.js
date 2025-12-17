/**
 * Google Apps Script Web App for Welding Simulator Backend
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Create a new Google Apps Script project
 * 2. Replace the default code with this script
 * 3. Set the SPREADSHEET_ID constant below - 1v9kAMoBqUs3YK2S2m0q1gHPyNaWYYnS1mu9YKfjwp9w
 * 4. Deploy as Web App with Execute as: Me, Who has access: Anyone
 * 5. Copy the Web App URL and update the GOOGLE_SHEETS_API_BASE in googleSheets.ts https://script.google.com/macros/s/AKfycbzP6E7CkcBIUnZTbqPl9NKmzjvfkucDAmh0fnjCbFsnz35U7wz6p_RrAdb24QJYnALF/exec
 * 
 * REQUIRED SHEET STRUCTURE:
 * - Sheet name: "WeldingData"
 * - Headers in row 1:
 *   A: id, B: userId, C: userName, D: technique, E: startTime, F: endTime,
 *   G: duration, H: finalScore, I: grade, J: avgAngleAccuracy,
 *   K: avgDistanceStability, L: avgSpeedConsistency, M: avgSmoothness,
 *   N: totalDataPoints, O: createdAt, P: updatedAt
 */

// Configuration
const SPREADSHEET_ID = '1v9kAMoBqUs3YK2S2m0q1gHPyNaWYYnS1mu9YKfjwp9w'; // Replace with your spreadsheet ID
const SHEET_NAME = 'WeldingData';

/**
 * Main doGet handler for HTTP GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case 'test':
        return createResponse({ 
          success: true, 
          data: { 
            message: 'Welding Simulator API is running', 
            timestamp: new Date().toISOString() 
          } 
        });
        
      case 'getUserStatistics':
        const userId = e.parameter.userId;
        if (!userId) {
          return createResponse({ success: false, error: 'userId parameter required' });
        }
        return getUserStatistics(userId);
        
      case 'getLeaderboard':
        const technique = e.parameter.technique;
        const limit = parseInt(e.parameter.limit) || 50;
        return getLeaderboard(technique, limit);
        
      case 'validateCertificate':
        const code = e.parameter.code;
        if (!code) {
          return createResponse({ success: false, error: 'code parameter required' });
        }
        return validateCertificate(code);
        
      case 'exportUserData':
        const exportUserId = e.parameter.userId;
        if (!exportUserId) {
          return createResponse({ success: false, error: 'userId parameter required' });
        }
        return exportUserData(exportUserId);
        
      default:
        return createResponse({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('GET request error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Main doPost handler for HTTP POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const postData = JSON.parse(e.postData.contents);
    
    switch (action) {
      case 'saveSession':
        return saveSession(postData);
        
      case 'saveCertificate':
        return saveCertificate(postData);
        
      case 'saveProfile':
        return saveProfile(postData);
        
      case 'saveSessionsBatch':
        return saveSessionsBatch(postData);
        
      default:
        return createResponse({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('POST request error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Main doDelete handler for HTTP DELETE requests
 */
function doDelete(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case 'deleteUserData':
        const userId = e.parameter.userId;
        if (!userId) {
          return createResponse({ success: false, error: 'userId parameter required' });
        }
        return deleteUserData(userId);
        
      default:
        return createResponse({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('DELETE request error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Save welding session to Google Sheets
 */
function saveSession(sessionData) {
  try {
    const sheet = getSheet();
    
    // Check if session already exists
    const existingRow = findSessionById(sessionData.id);
    const now = new Date().toISOString();
    
    const rowData = [
      sessionData.id,
      sessionData.userId,
      sessionData.userName,
      sessionData.technique,
      sessionData.startTime,
      sessionData.endTime,
      sessionData.duration,
      sessionData.finalScore,
      sessionData.grade,
      sessionData.avgAngleAccuracy,
      sessionData.avgDistanceStability,
      sessionData.avgSpeedConsistency,
      sessionData.avgSmoothness,
      sessionData.totalDataPoints,
      sessionData.createdAt || now,
      now
    ];
    
    if (existingRow > 0) {
      // Update existing row
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return createResponse({ 
        success: true, 
        data: { rowId: existingRow.toString(), updated: true } 
      });
    } else {
      // Add new row
      sheet.appendRow(rowData);
      const newRow = sheet.getLastRow();
      return createResponse({ 
        success: true, 
        data: { rowId: newRow.toString(), created: true } 
      });
    }
  } catch (error) {
    console.error('Save session error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Save certificate to Google Sheets
 */
function saveCertificate(certificateData) {
  try {
    // For certificates, we'll use a separate sheet or add columns
    // This is a simplified version - you might want a separate "Certificates" sheet
    const sheet = getSheet();
    
    // Find certificate by validation code
    const existingRow = findCertificateByCode(certificateData.validationCode);
    const now = new Date().toISOString();
    
    // For now, we'll add certificate data as additional columns
    // In a real implementation, you'd have a separate Certificates sheet
    const certRowData = [
      certificateData.id,
      certificateData.userName,
      certificateData.technique,
      certificateData.score,
      certificateData.grade,
      certificateData.duration,
      certificateData.date,
      certificateData.validationCode,
      certificateData.sessionId,
      now
    ];
    
    if (existingRow > 0) {
      // Update existing certificate (this would need proper column mapping)
      return createResponse({ success: true, data: { rowId: existingRow.toString(), updated: true } });
    } else {
      // For simplicity, we'll store certificates in a separate sheet
      return saveCertificateToSeparateSheet(certRowData);
    }
  } catch (error) {
    console.error('Save certificate error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Save certificate to separate sheet (recommended)
 */
function saveCertificateToSeparateSheet(certRowData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let certSheet = ss.getSheetByName('Certificates');
    
    // Create Certificates sheet if it doesn't exist
    if (!certSheet) {
      certSheet = ss.insertSheet('Certificates');
      certSheet.getRange(1, 1, 1, certRowData.length).setValues([[
        'id', 'userName', 'technique', 'score', 'grade', 'duration', 
        'date', 'validationCode', 'sessionId', 'createdAt'
      ]]);
    }
    
    certSheet.appendRow(certRowData);
    const newRow = certSheet.getLastRow();
    
    return createResponse({ 
      success: true, 
      data: { rowId: newRow.toString(), created: true } 
    });
  } catch (error) {
    console.error('Save certificate to separate sheet error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Save user profile
 */
function saveProfile(profileData) {
  try {
    const sheet = getSheet();
    
    // Find profile by user ID
    const existingRow = findProfileById(profileData.id);
    const now = new Date().toISOString();
    
    const rowData = [
      profileData.id,
      profileData.name,
      profileData.email,
      profileData.preferredTechnique,
      profileData.totalSessions,
      profileData.bestScores,
      profileData.createdAt,
      now
    ];
    
    if (existingRow > 0) {
      // Update existing profile
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return createResponse({ 
        success: true, 
        data: { rowId: existingRow.toString(), updated: true } 
      });
    } else {
      // Add new profile (you might want a separate Profiles sheet)
      sheet.appendRow(rowData);
      const newRow = sheet.getLastRow();
      return createResponse({ 
        success: true, 
        data: { rowId: newRow.toString(), created: true } 
      });
    }
  } catch (error) {
    console.error('Save profile error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Get user statistics
 */
function getUserStatistics(userId) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Filter data for specific user
    const userSessions = data.slice(1).filter(row => row[1] === userId);
    
    if (userSessions.length === 0) {
      return createResponse({
        success: true,
        data: {
          totalSessions: 0,
          bestScores: {},
          averageScore: 0,
          totalTime: 0,
          techniques: []
        }
      });
    }
    
    // Calculate statistics
    const techniques = [...new Set(userSessions.map(row => row[3]))];
    const totalSessions = userSessions.length;
    const scores = userSessions.map(row => row[7]); // finalScore column
    const durations = userSessions.map(row => row[6]); // duration column
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const totalTime = durations.reduce((sum, duration) => sum + duration, 0);
    
    // Calculate best scores by technique
    const bestScores = {};
    techniques.forEach(technique => {
      const techniqueScores = userSessions
        .filter(row => row[3] === technique)
        .map(row => row[7]);
      bestScores[technique] = Math.max(...techniqueScores);
    });
    
    return createResponse({
      success: true,
      data: {
        totalSessions,
        bestScores,
        averageScore: Math.round(averageScore * 100) / 100,
        totalTime,
        techniques
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Get leaderboard data
 */
function getLeaderboard(technique, limit) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Filter by technique if specified
    let filteredData = data.slice(1); // Skip headers
    if (technique) {
      filteredData = filteredData.filter(row => row[3] === technique);
    }
    
    // Sort by final score (descending) and take top results
    const sortedData = filteredData
      .sort((a, b) => b[7] - a[7]) // Sort by finalScore column
      .slice(0, limit)
      .map(row => ({
        userName: row[2],
        technique: row[3],
        score: row[7],
        date: row[4],
        validationCode: '' // This would come from certificates sheet
      }));
    
    return createResponse({
      success: true,
      data: sortedData
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Validate certificate
 */
function validateCertificate(validationCode) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const certSheet = ss.getSheetByName('Certificates');
    
    if (!certSheet) {
      return createResponse({ success: true, data: null });
    }
    
    const data = certSheet.getDataRange().getValues();
    const certificate = data.slice(1).find(row => row[7] === validationCode); // validationCode column
    
    if (!certificate) {
      return createResponse({ success: true, data: null });
    }
    
    const certData = {
      id: certificate[0],
      userName: certificate[1],
      technique: certificate[2],
      score: certificate[3],
      grade: certificate[4],
      duration: certificate[5],
      date: certificate[6],
      validationCode: certificate[7],
      sessionId: certificate[8]
    };
    
    return createResponse({
      success: true,
      data: certData
    });
  } catch (error) {
    console.error('Validate certificate error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Export user data (for GDPR compliance)
 */
function exportUserData(userId) {
  try {
    // This is a placeholder implementation
    // In a real app, you'd export all user-related data
    return createResponse({
      success: true,
      data: {
        profile: {}, // Get profile data
        sessions: [], // Get all user sessions
        certificates: [] // Get all user certificates
      }
    });
  } catch (error) {
    console.error('Export user data error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Delete user data (for GDPR compliance)
 */
function deleteUserData(userId) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Find rows to delete
    const rowsToDelete = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) { // userId column
        rowsToDelete.push(i + 1); // +1 because sheet rows are 1-indexed
      }
    }
    
    // Delete rows (from bottom to top to maintain indices)
    rowsToDelete.sort((a, b) => b - a);
    rowsToDelete.forEach(rowIndex => {
      sheet.deleteRow(rowIndex);
    });
    
    return createResponse({
      success: true,
      data: { deleted: true, rowsDeleted: rowsToDelete.length }
    });
  } catch (error) {
    console.error('Delete user data error:', error);
    return createResponse({ success: false, error: error.toString() });
  }
}

/**
 * Helper function to get the main sheet
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Set up headers
    sheet.getRange(1, 1, 1, 16).setValues([[
      'id', 'userId', 'userName', 'technique', 'startTime', 'endTime',
      'duration', 'finalScore', 'grade', 'avgAngleAccuracy',
      'avgDistanceStability', 'avgSpeedConsistency', 'avgSmoothness',
      'totalDataPoints', 'createdAt', 'updatedAt'
    ]]);
  }
  
  return sheet;
}

/**
 * Find session by ID
 */
function findSessionById(sessionId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      return i + 1; // +1 because sheet rows are 1-indexed
    }
  }
  
  return -1;
}

/**
 * Find certificate by validation code
 */
function findCertificateByCode(validationCode) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const certSheet = ss.getSheetByName('Certificates');
  
  if (!certSheet) return -1;
  
  const data = certSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === validationCode) { // validationCode column
      return i + 1; // +1 because sheet rows are 1-indexed
    }
  }
  
  return -1;
}

/**
 * Find profile by user ID
 */
function findProfileById(userId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) { // userId column
      return i + 1; // +1 because sheet rows are 1-indexed
    }
  }
  
  return -1;
}

/**
 * Create standardized HTTP response
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}