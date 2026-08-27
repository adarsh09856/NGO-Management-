const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/db');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded media / certificates / receipts statically
app.use('/uploads', express.static(uploadDir));

// Mount REST API Router
app.use('/api', apiRouter);

// Serve Frontend Static Build (when compiled into dist/)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA Fallback for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Drodul Phendey Ling Foundation API Server is running.',
      frontendStatus: 'Run `npm run build` to build and serve the React frontend through this server, or run `npm run dev` for Vite dev server.',
      apiDocs: '/api/settings'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`☸ Drodul Phendey Ling Monastery CRM Server Online`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Uploads Dir: ${uploadDir}`);
    console.log(`=======================================================`);
  });
}

startServer();

module.exports = app;
