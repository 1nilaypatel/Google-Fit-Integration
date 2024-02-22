const express = require("express");
const session = require("express-session");
const { google } = require("googleapis");
const cors = require("cors");

const credentials = require("./creds.json");
const { client_secret, client_id, redirect_uris } = credentials.web;
console.log(redirect_uris);
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
];

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
  })
);

app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/auth/google", (req, res) => {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("/auth/google working");
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Error generating auth URL" });
  }
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    console.log("auth/google/callback working");
    res.redirect("http://localhost:5173/home");
  } catch (error) {
    console.error("Error retrieving access token:", error);
    res.redirect("/error");
  }
});

app.get("/fetch-step-count", async (req, res) => {
  try {
    const fitness = google.fitness({
      version: "v1",
      auth: oAuth2Client,
    });

    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 }, // Aggregate data in daily buckets
        // shawing data for past 30 days
        startTimeMillis: Date.now() - 30 * 24 * 60 * 60 * 1000,
        endTimeMillis: Date.now(), // Current time
      },
    });

    const stepCountData = response.data.bucket.map((data) => {
      const point = data.dataset[0]?.point[0]?.value[0];
      const step_count = point?.intVal || 0;
      return {
        date: new Date(parseInt(data.startTimeMillis)).toDateString(),
        step_count: step_count,
      };
    });
    
    console.log("/fetch-step-count working");
    res.json({ stepCountData });
  } catch (error) {
    console.error("Error fetching step count data:", error);
    res.status(500).json({ error: "Error fetching step count data" });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
