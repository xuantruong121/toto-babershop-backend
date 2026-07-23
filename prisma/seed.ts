import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with rich sample data...')

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@totobarber.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@totobarber.com',
      name: 'ToTo Admin Master',
      password: adminPassword,
      role: 'ADMIN'
    },
  })

  // 2. Create Sample Customers
  const customerPassword = await bcrypt.hash('123456', 10)
  const customer1 = await prisma.user.upsert({
    where: { email: 'xuantruong@gmail.com' },
    update: { password: customerPassword },
    create: {
      email: 'xuantruong@gmail.com',
      name: 'Xuân Trường',
      password: customerPassword,
      role: 'CUSTOMER'
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'minhtuan@gmail.com' },
    update: { password: customerPassword },
    create: {
      email: 'minhtuan@gmail.com',
      name: 'Minh Tuấn',
      password: customerPassword,
      role: 'CUSTOMER'
    },
  })

  // 3. Clean existing operational data safely
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.productVariant.deleteMany({})
  await prisma.product.deleteMany({})

  // 4. Grooming Products (Hair styling products)
  const groomingProducts = [
    {
      name: 'Reuzel Pink Pomade Grease',
      type: 'Grooming',
      category: 'Pomade',
      price: 420000,
      image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop',
      description: 'Pomade gốc dầu độ giữ nếp cực cao (Heavy Hold), bóng nhẹ, mùi hương kẹo cao su quyến rũ.'
    },
    {
      name: 'Kevin Murphy Rough Rider',
      type: 'Grooming',
      category: 'Clay',
      price: 650000,
      image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=600&auto=format&fit=crop',
      description: 'Sáp đất sét cao cấp giữ nếp kiên cố, hoàn thiện mờ tự nhiên, dưỡng tóc chắc khỏe.'
    },
    {
      name: 'O\'Douds Matte Paste',
      type: 'Grooming',
      category: 'Paste',
      price: 480000,
      image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop',
      description: 'Matte Paste hữu cơ từ Mỹ, tạo phồng (Volume) cực tốt và kết cấu phồng tóc (Texture) đẹp mắt.'
    },
    {
      name: 'Apestomen Volcanic Clay',
      type: 'Grooming',
      category: 'Clay',
      price: 340000,
      image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=600&auto=format&fit=crop',
      description: 'Sáp tạo kiểu quốc dân thích hợp cho chất tóc dày cứng của nam giới Việt Nam.'
    },
    {
      name: 'Bona Fide Super Hold Pomade',
      type: 'Grooming',
      category: 'Pomade',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop',
      description: 'Pomade gốc nước dễ gội rửa, độ bóng mượt thích hợp cho các kiểu tóc Classic Pompadour.'
    }
  ]

  for (const p of groomingProducts) {
    await prisma.product.create({
      data: {
        ...p,
        variants: {
          create: [
            { size: 'Tiêu chuẩn 113g', color: 'Mặc định', stock: 50, sku: `GRM-${p.name.substring(0,4).toUpperCase()}-113G` }
          ]
        }
      }
    })
  }

  // 5. Fashion Products (Streetwear & Accessories with Size/Color Variants)
  const fashionProducts = [
    {
      name: 'TOTO Classic Heavyweight Tee',
      type: 'Fashion',
      category: 'Áo thun',
      price: 380000,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
      description: 'Áo thun Cotton 100% 250gsm định hình phom Oversize chuẩn phong cách Streetwear.'
    },
    {
      name: 'TOTO Signature Barber Apron',
      type: 'Fashion',
      category: 'Phụ kiện',
      price: 890000,
      image: 'https://images.unsplash.com/photo-1588667635678-831ddcd113ae?q=80&w=600&auto=format&fit=crop',
      description: 'Tạp dề Barber chuyên nghiệp phối Canvas chống thấm và quai da bò nguyên tấm.'
    },
    {
      name: 'TOTO Vintage Snapback Cap',
      type: 'Fashion',
      category: 'Nón',
      price: 290000,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop',
      description: 'Nón lưỡi trai thêu nổi Logo ToTo phong cách Retro Classic.'
    }
  ]

  for (const p of fashionProducts) {
    const isShirt = p.category === 'Áo thun'
    const sizes = isShirt ? ['S', 'M', 'L', 'XL'] : ['Freesize']

    await prisma.product.create({
      data: {
        ...p,
        variants: {
          create: sizes.map(size => ({
            size,
            color: 'Đen',
            stock: 25,
            sku: `FSH-${p.name.split(' ').map(w => w[0]).join('').toUpperCase()}-${size}`
          }))
        }
      }
    })
  }

  // 6. Fetch Back Products to Create Real-time Orders
  const allProducts = await prisma.product.findMany({ include: { variants: true } })
  const p0 = allProducts[0]
  const p5 = allProducts[5]

  if (p0 && p5 && p0.variants[0] && p5.variants[1]) {
    await prisma.order.create({
      data: {
        userId: customer1.id,
        total: 1220000,
        status: 'COMPLETED',
        items: {
          create: [
            {
              productId: p0.id,
              variantId: p0.variants[0].id,
              quantity: 2,
              price: 420000
            },
            {
              productId: p5.id,
              variantId: p5.variants[1].id, // Size M
              quantity: 1,
              price: 380000
            }
          ]
        }
      }
    })

    await prisma.order.create({
      data: {
        userId: customer2.id,
        total: 890000,
        status: 'PENDING',
        items: {
          create: [
            {
              productId: allProducts[6]?.id || p0.id,
              variantId: allProducts[6]?.variants[0]?.id || p0.variants[0].id,
              quantity: 1,
              price: 890000
            }
          ]
        }
      }
    })
  }

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
