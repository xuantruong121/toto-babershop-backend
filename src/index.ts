import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Toto Barbershop API is running');
});

// --- PRODUCTS API ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image, category, type } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price, image, category, type }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// --- AUTH API ---
// Basic mock login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: Add real bcrypt validation
  if (email === 'admin@totobarber.com' && password === 'admin') {
    res.json({ token: 'mock-jwt-token', user: { name: 'Admin', role: 'ADMIN', email } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// --- STATS API ---
app.get('/api/stats', async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const newOrders = orders.length;
    
    const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
    const newCustomers = users.length;

    res.json({
      revenue: totalRevenue,
      orders: newOrders,
      customers: newCustomers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
