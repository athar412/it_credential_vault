import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  const response = NextResponse.redirect(url);
  response.cookies.delete('auth_token');
  return response;
}
