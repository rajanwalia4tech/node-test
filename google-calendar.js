const express = require('express');
const { google } = require('googleapis');

const app = express();
const PORT = 3000;

// Google OAuth2 credentials
const CLIENT_ID = '126731899436-aruhjjfdov0i8alniku57839mvj4th17.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/rest/v1/calendar/redirect/';

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

app.get('/', (req, res) => {
    res.send('<a href="/rest/v1/calendar/init/">Connect to Google Calendar</a>');
});

// Step 1: GoogleCalendarInitView
app.get('/rest/v1/calendar/init/', (req, res) => {
  // Generate the URL for user authorization
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  res.redirect(authUrl);
});

// Step 2: GoogleCalendarRedirectView
app.get('/rest/v1/calendar/redirect/', async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange authorization code for access token
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Create a Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Retrieve a list of events from the user's calendar
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Process the list of events
    const events = data.items.map((event) => ({
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    }));

    // Display the events
    res.json(events);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).send('Error retrieving events');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
