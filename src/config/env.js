// This file must be imported first in any module that needs env variables
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log configuration status
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables loaded');
}

export default process.env;
