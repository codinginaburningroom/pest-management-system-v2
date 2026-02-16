const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ======================
// Middleware
// ======================
app.use(cors({
  origin: '*', // อนุญาตทุก origin (dev mode)
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Routes
// ======================
app.use('/api/farms', require('./routes/farms'));
app.use('/api/plots', require('./routes/plots'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/targets', require('./routes/targets'));
app.use('/api/moa', require('./routes/moa'));
app.use('/api/plot-crops', require('./routes/plotCrops'));
app.use('/api/applications', require('./routes/applications'));

// ======================
// Health check
// ======================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Pest Management API is running',
    timestamp: new Date().toISOString()
  });
});

// ======================
// Error handling
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  });
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3000;

// 🔥 สำคัญมาก: bind 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Local: http://localhost:${PORT}/api/health`);
  console.log(`📡 Network: http://10.201.36.101:${PORT}/api/health`);
});
