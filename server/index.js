const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");
const cors = require("cors");

// Load OAuth2 credentials from creds.json file
const credentials = require("./creds.json");
const { client_secret, client_id, redirect_uris } = credentials.web;

// Initialize OAuth2 client with credentials
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Define OAuth2 scopes for fitness activity read permission
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
];

// Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
    origin: "http://localhost:5173",
  })
);

// Enable session middleware to manage user sessions
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
  })
);

// Route to initiate Google OAuth2 authentication flow
app.get("/auth/google", (req, res) => {
  try {
    // Generate authentication URL with necessary scopes
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("/auth/google working");
    // Respond with the generated authentication URL
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    // Respond with error status if URL generation fails
    res.status(500).json({ error: "Error generating auth URL" });
  }
});

// Route to handle Google OAuth2 callback
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access tokens
    const { tokens } = await oAuth2Client.getToken(code);
    // Set access tokens in OAuth2 client
    oAuth2Client.setCredentials(tokens);
    // Store tokens in session for future use
    req.session.tokens = tokens;
    console.log("auth/google/callback working");
    // Redirect user to home page after successful authentication
    res.redirect("http://localhost:5173/home");
  } catch (error) {
    console.error("Error retrieving access token:", error);
    // Redirect to error page if token retrieval fails
    res.redirect("/error");
  }
});

// Route to fetch step count data from Google Fitness API
app.get("/fetch-step-count", async (req, res) => {
  try {
    // Create fitness client with authenticated OAuth2 client
    const fitness = google.fitness({
      version: "v1",
      auth: oAuth2Client,
    });

    // Request aggregated step count data
    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 }, // Aggregate data in daily buckets
        startTimeMillis: Date.now() - 30 * 24 * 60 * 60 * 1000, // Show data for past 30 days
        endTimeMillis: Date.now(), // Current time
      },
    });

    // Extract step count data from API response
    const stepCountData = response.data.bucket.map((data) => {
      const point = data.dataset[0]?.point[0]?.value[0];
      const step_count = point?.intVal || 0;
      return {
        date: new Date(parseInt(data.startTimeMillis)).toDateString(),
        step_count: step_count,
      };
    });
    
    console.log("/fetch-step-count working");
    // Respond with fetched step count data
    res.json({ stepCountData });
  } catch (error) {
    console.error("Error fetching step count data:", error);
    // Respond with error status if data fetching fails
    res.status(500).json({ error: "Error fetching step count data" });
  }
});

// Start Express server listening on port 8000
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
