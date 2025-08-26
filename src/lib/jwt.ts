/**
 * JWT Token utilities for authentication
 * In a real implementation, these would handle actual JWT operations
 */

export interface JWTPayload {
  sub: string // user id
  email: string
  role: 'user' | 'admin'
  exp: number // expiration timestamp
  iat: number // issued at timestamp
}

/**
 * Decodes a JWT token (mock implementation)
 * In production, use a proper JWT library like jose
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Mock implementation - in reality, this would decode the actual JWT
    if (token.includes('admin')) {
      return {
        sub: 'admin-1',
        email: 'admin@teach.com',
        role: 'admin',
        exp: Date.now() / 1000 + 3600, // 1 hour from now
        iat: Date.now() / 1000
      }
    } else if (token.includes('user')) {
      return {
        sub: 'user-1',
        email: 'user@teach.com',
        role: 'user',
        exp: Date.now() / 1000 + 3600, // 1 hour from now
        iat: Date.now() / 1000
      }
    }
    return null
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) return true
  
  const currentTime = Date.now() / 1000
  return payload.exp < currentTime
}

/**
 * Gets the time remaining until token expiration
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJWT(token)
  if (!payload) return 0
  
  const currentTime = Date.now() / 1000
  return Math.max(0, payload.exp - currentTime)
}

/**
 * Formats expiration time for display
 */
export function formatTokenExpiration(token: string): string {
  const timeRemaining = getTokenTimeRemaining(token)
  
  if (timeRemaining <= 0) return 'Expirado'
  
  const hours = Math.floor(timeRemaining / 3600)
  const minutes = Math.floor((timeRemaining % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m restantes`
  } else {
    return `${minutes}m restantes`
  }
}