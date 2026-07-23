import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { items, total, discount, promoCode, idempotencyKey } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'Giỏ hàng trống' });
    if (!idempotencyKey) return res.status(400).json({ error: 'Thiếu idempotencyKey' });

    // Kiểm tra Idempotency Key (chặn double-submit)
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey }
    });
    if (existingOrder) {
      return res.json(existingOrder); // Trả về đơn hàng cũ
    }

    // Transaction với row lock (for update)
    const order = await prisma.$transaction(async (tx) => {
      // Khóa và kiểm tra từng sản phẩm
      for (const item of items) {
        // Khóa row (FOR UPDATE)
        const variantRows = await tx.$queryRaw<any[]>`
          SELECT stock FROM "ProductVariant"
          WHERE id = ${item.variantId}
          FOR UPDATE
        `;

        if (!variantRows || variantRows.length === 0) {
          throw new Error(`Sản phẩm (Variant ID: ${item.variantId}) không tồn tại.`);
        }

        const currentStock = variantRows[0].stock;
        if (currentStock < item.quantity) {
          throw new Error(`Sản phẩm không đủ số lượng trong kho.`);
        }

        // Trừ kho
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: currentStock - item.quantity }
        });
      }

      // Xử lý mã giảm giá nếu có
      if (promoCode) {
        const promoRows = await tx.$queryRaw<any[]>`
          SELECT * FROM "PromoCode"
          WHERE code = ${promoCode}
          FOR UPDATE
        `;
        if (promoRows && promoRows.length > 0) {
          const p = promoRows[0];
          if (p.isActive && (p.usageLimit === null || p.usedCount < p.usageLimit)) {
            await tx.promoCode.update({
              where: { code: promoCode },
              data: { usedCount: p.usedCount + 1 }
            });
          } else {
            throw new Error('Mã giảm giá không hợp lệ hoặc đã hết lượt dùng.');
          }
        }
      }

      // Tạo đơn hàng
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          discount: discount || 0,
          promoCode,
          idempotencyKey,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
              price: i.price
            }))
          }
        }
      });

      return newOrder;
    });

    res.json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    // Xử lý lỗi trùng lặp idempotencyKey do race condition (unique constraint)
    if (error.code === 'P2002') {
       return res.status(409).json({ error: 'Đơn hàng đã được tạo trước đó.' });
    }
    res.status(400).json({ error: error.message || 'Lỗi tạo đơn hàng' });
  }
};

// Webhook thanh toán (Idempotent webhook)
export const paymentWebhook = async (req: Request, res: Response) => {
  try {
    const { orderId, transactionId, status, signature } = req.body;
    
    // TODO: Verify signature từ VNPay/MoMo ở đây
    // if (!verifySignature(signature, req.body)) return res.status(400).send('Invalid signature');

    if (status !== 'SUCCESS') {
      return res.status(200).send('OK'); // Không xử lý nếu fail
    }

    await prisma.$transaction(async (tx) => {
      // Khóa đơn hàng
      const orderRows = await tx.$queryRaw<any[]>`
        SELECT "paymentStatus" FROM "Order"
        WHERE id = ${orderId}
        FOR UPDATE
      `;

      if (!orderRows || orderRows.length === 0) {
        throw new Error('Order not found');
      }

      if (orderRows[0].paymentStatus === 'PAID') {
        return; // Đã xử lý rồi, bỏ qua, không charge/trừ kho 2 lần
      }

      // Cập nhật trạng thái
      await tx.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: 'PAID',
          transactionId 
        }
      });
      
      // TODO: Gửi email xác nhận
    });

    res.status(200).send('OK'); // Luôn trả 200 để cổng thanh toán không retry
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
};
