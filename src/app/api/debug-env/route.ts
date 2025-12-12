import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const ok = !!process.env.DATABASE_URL;
  const jwt = process.env.JWT_SECRET ? 'SET' : 'NOT SET';
  const spotify = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? 'PUBLIC SET' : 'PUBLIC NOT SET';
  return NextResponse.json({ database_url: ok, jwt_secret: jwt, spotify_client: spotify });
}