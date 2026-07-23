import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import promoRoutes from './routes/promoRoutes.js';

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*', // Customize for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Toto Barbershop Secure API is running');
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/promo', promoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔒 Server is running securely on port ${PORT}`);
});
