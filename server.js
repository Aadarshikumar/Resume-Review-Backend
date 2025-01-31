const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use API routes
app.use('/api', apiRoutes);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Resume Evaluation API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

