/**
 * Pattern recognition utilities for AR marker detection
 */

export interface MarkerCorner {
  x: number
  y: number
}

export interface DetectedPattern {
  corners: MarkerCorner[]
  center: { x: number; y: number }
  size: number
  confidence: number
  timestamp: number
}

/**
 * Detect square patterns in image data
 */
export const detectSquarePatterns = (
  imageData: ImageData,
  threshold: number = 100,
  minSize: number = 20
): DetectedPattern[] => {
  const { data, width, height } = imageData
  const patterns: DetectedPattern[] = []

  // Convert to grayscale
  const grayData = new Uint8ClampedArray(width * height)
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    grayData[i / 4] = gray
  }

  // Find potential corner points
  const cornerPoints = findCornerPoints(grayData, width, height, threshold)

  // Group corner points into squares
  const squares = groupCornersIntoSquares(cornerPoints, width, height, minSize)

  return squares.map(square => ({
    corners: square.corners,
    center: calculateCenter(square.corners),
    size: calculateSize(square.corners),
    confidence: calculateConfidence(square),
    timestamp: Date.now()
  }))
}

/**
 * Find corner points using Harris corner detection
 */
const findCornerPoints = (
  grayData: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number
): MarkerCorner[] => {
  const corners: MarkerCorner[] = []
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)

  for (let y = offset; y < height - offset; y++) {
    for (let x = offset; x < width - offset; x++) {
      const centerIdx = y * width + x
      const centerValue = grayData[centerIdx]

      let isCorner = true
      let varianceSum = 0

      // Check surrounding pixels
      for (let ky = -offset; ky <= offset; ky++) {
        for (let kx = -offset; kx <= offset; kx++) {
          if (kx === 0 && ky === 0) continue
          
          const neighborIdx = (y + ky) * width + (x + kx)
          const neighborValue = grayData[neighborIdx]
          
          // Calculate gradient
          const gradient = Math.abs(centerValue - neighborValue)
          varianceSum += gradient
        }
      }

      const averageGradient = varianceSum / (kernelSize * kernelSize - 1)
      
      if (averageGradient > threshold) {
        corners.push({ x, y })
      }
    }
  }

  return corners
}

/**
 * Group corner points into potential squares
 */
const groupCornersIntoSquares = (
  corners: MarkerCorner[],
  width: number,
  height: number,
  minSize: number
): Array<{ corners: MarkerCorner[]; confidence: number }> => {
  const squares: Array<{ corners: MarkerCorner[]; confidence: number }> = []

  for (let i = 0; i < corners.length; i++) {
    for (let j = i + 1; j < corners.length; j++) {
      for (let k = j + 1; k < corners.length; k++) {
        for (let l = k + 1; l < corners.length; l++) {
          const potentialSquare = [
            corners[i],
            corners[j],
            corners[k],
            corners[l]
          ]

          if (isValidSquare(potentialSquare, minSize)) {
            const confidence = calculateSquareConfidence(potentialSquare)
            squares.push({ corners: potentialSquare, confidence })
          }
        }
      }
    }
  }

  return squares.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Check if four points form a valid square
 */
const isValidSquare = (points: MarkerCorner[], minSize: number): boolean => {
  if (points.length !== 4) return false

  // Calculate distances between all pairs
  const distances: number[] = []
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x
      const dy = points[i].y - points[j].y
      distances.push(Math.sqrt(dx * dx + dy * dy))
    }
  }

  distances.sort((a, b) => a - b)

  // For a square, we expect:
  // - 4 small distances (sides) that should be approximately equal
  // - 2 large distances (diagonals) that should be approximately equal and ~1.4x the side length
  
  const sideLengths = distances.slice(0, 4)
  const diagonalLengths = distances.slice(4, 6)

  // Check if side lengths are similar (within 20% tolerance)
  const avgSide = sideLengths.reduce((sum, len) => sum + len, 0) / 4
  const sideVariance = sideLengths.reduce((sum, len) => sum + Math.pow(len - avgSide, 2), 0) / 4
  const sideCV = Math.sqrt(sideVariance) / avgSide

  if (sideCV > 0.2 || avgSide < minSize) return false

  // Check diagonal lengths are similar
  const avgDiagonal = (diagonalLengths[0] + diagonalLengths[1]) / 2
  const diagonalVariance = Math.abs(diagonalLengths[0] - diagonalLengths[1]) / avgDiagonal

  if (diagonalVariance > 0.2) return false

  // Check diagonal is approximately 1.4x side length
  const expectedDiagonal = avgSide * Math.sqrt(2)
  const diagonalRatio = avgDiagonal / expectedDiagonal

  return diagonalRatio > 0.8 && diagonalRatio < 1.6
}

/**
 * Calculate confidence score for a detected square
 */
const calculateSquareConfidence = (points: MarkerCorner[]): number => {
  // Base confidence on size, position, and regularity
  const center = calculateCenter(points)
  const size = calculateSize(points)
  
  // Larger squares get higher confidence (up to a point)
  const sizeScore = Math.min(size / 100, 1.0)
  
  // Center position score (prefer center of image)
  const centerScore = 1.0 - (Math.abs(center.x - 320) + Math.abs(center.y - 240)) / 800
  
  // Regularity score (already calculated in isValidSquare)
  const distances: number[] = []
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x
      const dy = points[i].y - points[j].y
      distances.push(Math.sqrt(dx * dx + dy * dy))
    }
  }
  distances.sort((a, b) => a - b)
  
  const avgSide = distances.slice(0, 4).reduce((sum, len) => sum + len, 0) / 4
  const sideVariance = distances.slice(0, 4).reduce((sum, len) => sum + Math.pow(len - avgSide, 2), 0) / 4
  const regularityScore = Math.max(0, 1.0 - (sideVariance / avgSide))

  return (sizeScore * 0.3 + centerScore * 0.3 + regularityScore * 0.4)
}

/**
 * Calculate center point of corners
 */
const calculateCenter = (corners: MarkerCorner[]): { x: number; y: number } => {
  const sumX = corners.reduce((sum, corner) => sum + corner.x, 0)
  const sumY = corners.reduce((sum, corner) => sum + corner.y, 0)
  
  return {
    x: sumX / corners.length,
    y: sumY / corners.length
  }
}

/**
 * Calculate size of square from corners
 */
const calculateSize = (corners: MarkerCorner[]): number => {
  const center = calculateCenter(corners)
  const distances = corners.map(corner => {
    const dx = corner.x - center.x
    const dy = corner.y - center.y
    return Math.sqrt(dx * dx + dy * dy)
  })
  
  return distances.reduce((sum, dist) => sum + dist, 0) / distances.length
}

/**
 * Calculate confidence for a detected pattern
 */
const calculateConfidence = (square: { corners: MarkerCorner[]; confidence: number }): number => {
  return Math.min(square.confidence, 1.0)
}

/**
 * Filter and smooth detected patterns over time
 */
export const smoothPatterns = (
  patterns: DetectedPattern[],
  maxAge: number = 5000,
  minConfidence: number = 0.5
): DetectedPattern[] => {
  const now = Date.now()
  
  return patterns
    .filter(pattern => 
      (now - pattern.timestamp) < maxAge && 
      pattern.confidence >= minConfidence
    )
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 1) // Keep only the best pattern
}

/**
 * Track pattern movement between frames
 */
export const trackPatternMovement = (
  previousPatterns: DetectedPattern[],
  currentPatterns: DetectedPattern[]
): DetectedPattern | null => {
  if (previousPatterns.length === 0 || currentPatterns.length === 0) {
    return currentPatterns[0] || null
  }

  const prevPattern = previousPatterns[0]
  const currPattern = currentPatterns[0]

  // Calculate movement vector
  const dx = currPattern.center.x - prevPattern.center.x
  const dy = currPattern.center.y - prevPattern.center.y
  const movement = Math.sqrt(dx * dx + dy * dy)

  // If movement is too large, might be a different pattern
  if (movement > 50) {
    return currPattern
  }

  // Smooth the movement
  const smoothingFactor = 0.3
  const smoothedCenter = {
    x: prevPattern.center.x + (currPattern.center.x - prevPattern.center.x) * smoothingFactor,
    y: prevPattern.center.y + (currPattern.center.y - prevPattern.center.y) * smoothingFactor
  }

  return {
    ...currPattern,
    center: smoothedCenter
  }
}