import express from 'express';
import { createServer } from 'http';
import routes from './routes';

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-User-Id');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  // API routes
  app.use(routes);
  
  // Create HTTP server
  const server = createServer(app);
  
  const PORT = parseInt(process.env.PORT || '3001', 10);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📺 Anime streaming platform with AnimeKai integration`);
  });
}

// Start the server
startServer().catch(console.error);