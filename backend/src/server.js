require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const { syncModels } = require('./models');
const { createDefaultAdmin } = require('./config/seeder');
const { initializeCronJobs } = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dojo API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/alerts', require('./routes/alerts'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  await connectDB();
  await syncModels();
  await createDefaultAdmin();
  
  app.listen(PORT, () => {
    console.log(`🥋 Dojo API running on port ${PORT}`);
    initializeCronJobs();
  });
};

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping cron jobs...');
  const { stopAllCronJobs } = require('./services/cronService');
  stopAllCronJobs();
  process.exit(0);
});

startServer();