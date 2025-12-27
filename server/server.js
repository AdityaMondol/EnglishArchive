import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken, checkEditor } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import notebookRoutes from './routes/notebooks.js';
import chapterRoutes from './routes/chapters.js';
import pageRoutes from './routes/pages.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Auth middleware - runs on all routes
app.use(verifyToken);
app.use(checkEditor);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/pages', pageRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Virtual Notebook API ready`);
});
