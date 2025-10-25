import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get the Google refresh token for the current authenticated user
 * @returns The refresh token or null if not found
 */
export async function getCurrentUserGoogleRefreshToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: 'google',
    },
  });

  return account?.refresh_token || null;
}

/**
 * Get the Google refresh token for a specific user
 * @param userId The user ID
 * @returns The refresh token or null if not found
 */
export async function getUserGoogleRefreshToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: 'google',
    },
  });

  return account?.refresh_token || null;
}

/**
 * Check if a user has connected their Google account
 * @param userId The user ID
 * @returns True if the user has a Google account connected
 */
export async function hasGoogleAccountConnected(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: 'google',
    },
  });

  return !!account;
}