import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export interface SessionData {
  user: {
    id: string;
    name: string;
    email: string;
    given_name?: string;
    family_name?: string;
  };
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt: number;
}

export function signJWT(payload: SessionData): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function verifyJWT(token: string): SessionData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionData;
  } catch {
    return null;
  }
}