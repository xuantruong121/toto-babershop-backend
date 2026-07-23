import type { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'admin@totobarber.com' && password === 'admin') {
    res.json({ token: 'mock-jwt-token', user: { name: 'Admin', role: 'ADMIN', email } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
