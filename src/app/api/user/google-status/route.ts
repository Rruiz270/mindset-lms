import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasGoogleAccountConnected } from '@/lib/google-auth-helper';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connected = await hasGoogleAccountConnected(session.user.id);

    return NextResponse.json({ connected });
  } catch (error) {
    console.error('Error checking Google connection status:', error);
    return NextResponse.json(
      { error: 'Failed to check Google connection status' },
      { status: 500 }
    );
  }
}