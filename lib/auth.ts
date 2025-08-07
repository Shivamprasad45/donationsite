import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable')
}

export interface TokenPayload {
  userId: string
  email: string
  role: 'user' | 'admin' | 'charity'
  charityId?: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export async function authenticateRequest(request: NextRequest): Promise<TokenPayload | null> {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    return payload
  } catch (error) {
    return null
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const payload = await authenticateRequest(request)
    
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return payload
  }
}
