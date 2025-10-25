# Google Calendar & Meet Integration Guide

## Overview

The Mindset LMS now integrates with Google Calendar to automatically create calendar events with Google Meet links for all class bookings. This integration is available for teachers who connect their Google accounts.

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google Meet API (automatically included with Calendar)

### 2. OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Configure the following:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### 3. OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Configure your app information
3. Add the following scopes:
   - `email`
   - `profile`
   - `openid`
   - `https://www.googleapis.com/auth/calendar.events`

### 4. Environment Variables

Update your `.env` file with the following:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
```

## How It Works

### For Teachers

1. **Connect Google Account:**
   - Navigate to Settings > Integrations
   - Click "Connect Google Account"
   - Authorize the app to access your Google Calendar

2. **Automatic Event Creation:**
   - When a student books a class, a Google Calendar event is automatically created
   - The event includes:
     - Class title with topic name
     - Student and teacher emails as attendees
     - Google Meet link automatically generated
     - Class description with level and pre/post-class instructions

3. **Event Management:**
   - When a booking is cancelled, the calendar event is automatically deleted
   - All attendees receive notifications according to their Google Calendar settings

### For Students

1. **Booking Classes:**
   - Book classes as usual through the platform
   - If the teacher has connected their Google account, you'll see a Google Meet link in your booking

2. **Joining Classes:**
   - Click the "Join Class" button to open Google Meet
   - You'll receive calendar invitations to your email

## Database Schema

The integration uses the following database fields:

- `Booking.googleEventId`: Stores the Google Calendar event ID
- `Booking.googleMeetLink`: Stores the Google Meet join link
- `Account`: Stores OAuth tokens for Google authentication

## API Endpoints

### Booking Creation (POST /api/bookings)
- Automatically creates Google Calendar events when teachers have connected accounts
- Stores event ID and Meet link in the booking record

### Booking Cancellation (PATCH /api/bookings/[id])
- Automatically deletes the Google Calendar event when a booking is cancelled
- Handles refunds according to the 6-hour cancellation policy

### Google Status Check (GET /api/user/google-status)
- Returns whether the current user has connected their Google account

## Security Considerations

1. **Token Storage:**
   - Refresh tokens are securely stored in the database
   - Access tokens are generated on-demand and not stored

2. **Scope Limitations:**
   - The app only requests calendar event permissions
   - No access to user's personal calendar data beyond created events

3. **Error Handling:**
   - If Google Calendar fails, bookings still proceed
   - Errors are logged but don't block the user experience

## Troubleshooting

### Common Issues

1. **"Failed to create Google Calendar event"**
   - Check that the Google Calendar API is enabled
   - Verify OAuth credentials are correct
   - Ensure the teacher has connected their Google account

2. **"Invalid credentials"**
   - Regenerate the OAuth client secret
   - Ensure environment variables are properly set
   - Check for spaces or special characters in credentials

3. **Missing Google Meet links**
   - Verify `conferenceDataVersion=1` is included in API calls
   - Check that the Google account has Meet enabled
   - Ensure proper scopes are authorized

### Testing

1. **Local Development:**
   - Use `http://localhost:3000` for redirect URIs
   - Test with a Google Workspace account for best results

2. **Production:**
   - Update redirect URIs to production domain
   - Test the full flow after deployment

## Future Enhancements

1. **Recurring Classes:**
   - Support for recurring Google Calendar events
   - Bulk booking with single calendar series

2. **Calendar Sync:**
   - Two-way sync to update bookings from Calendar changes
   - Automatic availability updates based on teacher's calendar

3. **Meeting Recording:**
   - Integration with Google Meet recording API
   - Automatic storage of class recordings