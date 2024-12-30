const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, '../../src')));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/jobs', require('./routes/job.routes'));

// Frontend routes
const routes = [
    '/',
    '/login',
    '/register',
    '/post-job',
    '/find-work',
    '/forgot-password',
    '/reset-password',
    '/profile',
    '/about',
    '/contact'
];

// Handle all frontend routes
routes.forEach(route => {
    app.get(route, (req, res) => {
        // For the root path, serve index.html
        if (route === '/') {
            res.sendFile(path.join(__dirname, '../../src/index.html'));
            return;
        }
        
        // For other routes, try to serve the corresponding HTML file
        const htmlFile = path.join(__dirname, `../../src${route}.html`);
        
        // Check if the HTML file exists
        if (require('fs').existsSync(htmlFile)) {
            res.sendFile(htmlFile);
        } else {
            // If file doesn't exist, serve the 404 page
            res.status(404).sendFile(path.join(__dirname, '../../src/404.html'));
        }
    });
});

// Handle client-side routing for hash routes
app.get('/*', (req, res) => {
    // Check if the request is for a static file
    const ext = path.extname(req.path);
    if (ext) {
        // If it's a static file that doesn't exist, send 404
        res.status(404).sendFile(path.join(__dirname, '../../src/404.html'));
    } else {
        // For all other routes, serve the index.html to handle client-side routing
        res.sendFile(path.join(__dirname, '../../src/index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;