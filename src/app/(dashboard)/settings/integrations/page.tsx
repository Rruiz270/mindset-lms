'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkGoogleConnection();
  }, [session]);

  const checkGoogleConnection = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/user/google-status');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Failed to check Google connection status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      await signIn('google', { 
        callbackUrl: '/settings/integrations',
        // This ensures we ask for calendar permissions
        prompt: 'consent',
      });
    } catch (error) {
      console.error('Failed to connect Google account:', error);
      setIsConnecting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your accounts to enhance your learning experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Google Calendar</CardTitle>
          </div>
          <CardDescription>
            Connect your Google account to automatically create calendar events with Google Meet links for your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Your Google account is connected. Calendar events will be automatically created for your bookings.
                </AlertDescription>
              </Alert>
              <Button variant="outline" disabled>
                Connected
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your Google account to enable automatic calendar event creation with Google Meet links.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleConnectGoogle}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Google Account'
                )}
              </Button>
            </div>
          )}

          {session?.user?.role === 'TEACHER' && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>For Teachers:</strong> When you connect your Google account, calendar events will be created in your Google Calendar for all bookings. Students will receive invitations to join the Google Meet session.
              </p>
            </div>
          )}

          {session?.user?.role === 'STUDENT' && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>For Students:</strong> Ask your teacher to connect their Google account to enable automatic Google Meet links for your classes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}