import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, role: true, addresses: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
      select: { id: true, email: true, name: true, phone: true, role: true, addresses: true }
    });

    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { province, district, ward, street, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        province,
        district,
        ward,
        street,
        isDefault: Boolean(isDefault)
      }
    });

    res.json(address);
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const addressId = parseInt(req.params.id as string);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      return res.status(404).json({ error: "Address not found" });
    }

    await prisma.address.delete({ where: { id: addressId } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const addressId = parseInt(req.params.id as string);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      return res.status(404).json({ error: "Address not found" });
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
