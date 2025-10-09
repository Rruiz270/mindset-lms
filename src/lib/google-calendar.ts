interface GoogleCalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{ email: string }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

export class GoogleCalendarService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    studentEmail: string;
    teacherEmail: string;
    topicName: string;
    studentLevel: string;
  }): Promise<{ eventId: string; meetLink?: string }> {
    const event: GoogleCalendarEvent = {
      summary: `${eventData.title} - ${eventData.topicName}`,
      description: `
English Class: ${eventData.topicName}
Level: ${eventData.studentLevel}
Student: ${eventData.studentEmail}
Teacher: ${eventData.teacherEmail}

${eventData.description}

Pre-class exercises should be completed before the session.
Post-class homework will be assigned after the lesson.
      `.trim(),
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [
        { email: eventData.studentEmail },
        { email: eventData.teacherEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: `mindset-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const createdEvent = await response.json();
      
      return {
        eventId: createdEvent.id,
        meetLink: createdEvent.conferenceData?.entryPoints?.[0]?.uri,
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, updates: Partial<GoogleCalendarEvent>): Promise<void> {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  }
}

export async function getGoogleAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Google access token');
  }

  const data = await response.json();
  return data.access_token;
}