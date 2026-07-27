import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-local-dev';

export type JWTPayload = {
  id: string;
  username: string;
  role: string;
  division: string | null;
  iat: number;
  exp: number;
};

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
