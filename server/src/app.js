import express from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyzeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/upload-pdf', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default app;
