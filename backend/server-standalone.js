/**
 * Standalone Express Server for Amplify Hosting
 * This allows Express backend to run on Amplify as a static build output
 */

const express = require('express');
const path = require('path');

// Import the main app
const app = require('./dist/app.js').default;

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MEDWEG Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});
