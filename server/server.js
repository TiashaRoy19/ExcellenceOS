const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, dbStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', (req, res, next) => {
  if (dbStatus.connected) {
    return next();
  }

  return res.status(503).json({
    message: 'Database is not connected',
    detail: dbStatus.message,
  });
});

// Route mappings
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/quizzes', require('./routes/quizzes'));

// Base route for server health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ExcellenceOS Backend is running',
    database: dbStatus,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ExcellenceOS Backend is healthy and running',
    database: dbStatus,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
