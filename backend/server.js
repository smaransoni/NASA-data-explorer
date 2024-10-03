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

// Start the Express server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
