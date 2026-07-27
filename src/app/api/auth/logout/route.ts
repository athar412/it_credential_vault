import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  
  const response = NextResponse.redirect(new URL('/login', `${protocol}://${host}`));
  response.cookies.delete('auth_token');
  return response;
}
