const express = require('express');
// const fetch = require('node-fetch');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for cross-origin requests from the frontend
app.use(cors());

// NASA API key from environment variables
const NASA_API_KEY = process.env.NASA_API_KEY;

// Route to get Astronomy Picture of the Day (APOD) data
app.get('/api/apod', async (req, res) => {
  try {
    // Use fetch to get data from NASA's APOD API
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    );

    // Check if the response is okay (status code 200-299)
    if (!response.ok) {
      throw new Error('Failed to fetch data from NASA');
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Send the data back to the client
    res.json(data);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/neofeed', async (req, res) => {
  // Get the current date
  const today = new Date();
  const defaulStartDate = today.toISOString().split('T')[0]; // Format to YYYY-MM-DD

  // Get the date 7 days from today
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 7);
  const defaultEndDate = futureDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD

  const START_DATE = req.query.start_date || defaulStartDate;
  const END_DATE = req.query.end_date || defaultEndDate;

  try {
    const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&api_key=${NASA_API_KEY}`;
    console.log(apiUrl);
    const response = await fetch(apiUrl);
    // console.log(response);
    // Check if the response is okay (status code 200-299)
    if (!response.ok) {
      // Try to extract the error message from the response
      const errorData = await response.json();
      throw new Error(
        errorData.error_message ||
          `Failed to fetch data from NASA NEO Feed API: ${apiUrl}`
      );
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Send the data back to the client
    res.json(data);
  } catch (err) {
    console.log(err.message);
    // Handle any errors
    res.status(500).json({ error: err.message });
  }
});

// Start the Express server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
