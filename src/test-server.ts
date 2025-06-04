// test-server.ts - Create this in your src folder
import express from 'express';

console.log('Starting minimal server test...');

const app = express();

// Add ONE middleware at a time to isolate the issue
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

const PORT = 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
});

export default server;