const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
console.log(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
// Redirect URI for authentication
app.get('/', (req, res) => {
  return res.send("HELLO")
});

app.get('/auth', (req, res) => {
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
  res.redirect(authUrl);
});

// Access Token endpoint
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const tokenUrl = `https://api.instagram.com/oauth/access_token`;

  try {
    const response = await axios.post(tokenUrl, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code
    });

    const { access_token } = response.data;
    // Store or use the access_token for future requests

    res.send('Access Token received successfully!');
  } catch (error) {
    console.error('Error exchanging code for access token:', error);
    res.status(500).send('Error exchanging code for access token');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
