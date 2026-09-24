import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import submissionRoutes from './routes/submissions.js';
import professorRoutes from './routes/professor.js';
import studentRoutes from './routes/student.js';

const app = express();

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin:
      process.env.CLIENT_URL
        ?.split(',')
        .map((x) => x.trim()) || true,
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// --------------------
// Root API
// --------------------
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'AcademicFlow API is running 🚀',
    version: '1.0.0',
  });
});

// --------------------
// Health Check
// --------------------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'AcademicFlow',
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
  });
});

// --------------------
// API Routes
// --------------------
app.use('/api/auth', authRoutes);

app.use('/api/assignments', assignmentRoutes);

app.use('/api/submissions', submissionRoutes);

app.use('/api/professor', professorRoutes);

app.use('/api/student', studentRoutes);

// --------------------
// 404 Handler
// --------------------
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// --------------------
// Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error',
  });
});

// --------------------
// Start Server
// --------------------
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    app.listen(port, () => {
      console.log(`AcademicFlow API on ${port}`);
    });
  })
  .catch((error) => {
    console.error(
      'MongoDB connection failed:',
      error.message
    );

    process.exit(1);
  });