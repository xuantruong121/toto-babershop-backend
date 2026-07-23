import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    
    if (!code || subtotal === undefined) {
      return res.status(400).json({ error: "Thiếu code hoặc subtotal" });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code }
    });

    if (!promo || !promo.isActive) {
      return res.status(400).json({ error: "Mã khuyến mãi không hợp lệ hoặc đã bị khóa." });
    }

    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ error: "Mã khuyến mãi đã hết lượt sử dụng." });
    }

    if (subtotal < promo.minOrderValue) {
      return res.status(400).json({ error: `Đơn hàng chưa đạt giá trị tối thiểu ${promo.minOrderValue.toLocaleString("vi-VN")}đ để sử dụng mã này.` });
    }

    let discount = 0;
    if (promo.discountType === "PERCENT") {
      discount = Math.floor(subtotal * (promo.discountValue / 100));
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else if (promo.discountType === "FIXED") {
      discount = promo.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    res.json({ success: true, discount, code: promo.code });
  } catch (error) {
    console.error("Validate promo error:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
