import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getStats = async (req: Request, res: Response) => {
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
};
