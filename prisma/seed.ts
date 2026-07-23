import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with variants...')

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@totobarber.com' },
    update: {},
    create: {
      email: 'admin@totobarber.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN'
    },
  })

  // 2. Create Dummy Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'Khách Hàng',
      password: await bcrypt.hash('123456', 10),
      role: 'CUSTOMER'
    },
  })

  // 3. Delete existing products if any (to avoid variant conflicts)
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.productVariant.deleteMany({})
  await prisma.product.deleteMany({})

  // 4. Create Grooming Products (Single Variant)
  const groomingData = [
    { name: 'Reuzel Pink Pomade', type: 'Grooming', category: 'Pomade', price: 420000, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop' },
    { name: 'Kevin Murphy Rough Rider', type: 'Grooming', category: 'Clay', price: 650000, image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=600&auto=format&fit=crop' },
    { name: 'O\'Douds Matte Paste', type: 'Grooming', category: 'Paste', price: 480000, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop' },
    { name: 'Apestomen Volcanic Clay', type: 'Grooming', category: 'Clay', price: 340000, image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=600&auto=format&fit=crop' },
  ]

  for (const p of groomingData) {
    await prisma.product.create({
      data: {
        ...p,
        variants: {
          create: [
            { size: 'Tiêu chuẩn', color: null, stock: 50, sku: `GRM-${p.name.substring(0,3).toUpperCase()}-STD` }
          ]
        }
      }
    })
  }

  // 5. Create Fashion Products (Multiple Variants)
  const fashionData = [
    { 
      name: 'ToTo Classic Tee - Black', 
      type: 'Fashion', 
      category: 'Áo thun', 
      price: 350000, 
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop',
      description: 'Chiếc áo thun đen tối giản mang logo Toto Barbershop.'
    },
    { 
      name: 'ToTo Premium Barber Apron', 
      type: 'Fashion', 
      category: 'Phụ kiện', 
      price: 850000, 
      image: 'https://images.unsplash.com/photo-1588667635678-831ddcd113ae?q=80&w=600&auto=format&fit=crop',
      description: 'Tạp dề da thật pha canvas cao cấp.'
    }
  ]

  for (const p of fashionData) {
    const isShirt = p.category === 'Áo thun'
    const sizes = isShirt ? ['S', 'M', 'L', 'XL'] : ['Freesize']
    
    await prisma.product.create({
      data: {
        ...p,
        variants: {
          create: sizes.map(size => ({
            size,
            color: 'Đen',
            stock: 20,
            sku: `FSH-${p.name.substring(0,3).toUpperCase()}-${size}`
          }))
        }
      }
    })
  }

  // Get products back to create orders
  const allProducts = await prisma.product.findMany({ include: { variants: true } })
  
  // 6. Create Mock Orders
  if (allProducts.length > 0) {
    await prisma.order.create({
      data: {
        userId: customer.id,
        total: 1190000,
        status: 'COMPLETED',
        items: {
          create: [
            { 
              productId: allProducts[0].id, 
              variantId: allProducts[0].variants[0].id,
              quantity: 2, 
              price: 420000 
            },
            { 
              productId: allProducts[4].id, 
              variantId: allProducts[4].variants[1].id, // Size M
              quantity: 1, 
              price: 350000 
            }
          ]
        }
      }
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
