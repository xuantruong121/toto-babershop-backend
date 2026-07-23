import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const products = [
  {
    slug: 'toto-strong-hold-pomade',
    title: 'Strong Hold Pomade',
    category: 'grooming',
    collection: 'pomade',
    excerpt: 'Pomade gốc nước, giữ nếp mạnh, bóng vừa.',
    description:
      'Strong Hold Pomade là pomade gốc nước đặc trưng của Toto, cho độ giữ nếp cao suốt cả ngày mà vẫn dễ gội sạch. Mùi hương nam tính, khô nhẹ, phù hợp cho các kiểu classic, pompadour và slick back.',
    images: ['/images/grooming-pomade.png', '/images/grooming-clay.png'],
    basePrice: 220000,
    featured: true,
    status: 'active',
    tags: ['giữ nếp mạnh', 'gốc nước', 'best seller'],
    rating: 4.8,
    reviewCount: 126,
    createdAt: new Date('2024-11-02T00:00:00.000Z'),
    variants: [
      { name: '80g', options: { size: '80g' }, price: 220000, stock: 42, sku: 'POM-80' },
      { name: '120g', options: { size: '120g' }, price: 290000, compareAtPrice: 320000, stock: 18, sku: 'POM-120' },
    ],
    seoTitle: 'Strong Hold Pomade | Toto', 
    seoDescription: 'Pomade giữ nếp mạnh gốc nước.'
  },
  {
    slug: 'matte-styling-clay',
    title: 'Matte Styling Clay',
    category: 'grooming',
    collection: 'clay',
    excerpt: 'Sáp tạo kiểu lì, độ phồng tự nhiên.',
    description:
      'Matte Styling Clay mang lại kết cấu lì hoàn toàn, tăng độ phồng và định hình mạnh cho tóc ngắn và trung bình. Lý tưởng cho crop, textured quiff và các kiểu tự nhiên.',
    images: ['/images/grooming-clay.png', '/images/grooming-pomade.png'],
    basePrice: 240000,
    featured: true,
    status: 'active',
    tags: ['matte', 'độ phồng'],
    rating: 4.7,
    reviewCount: 89,
    createdAt: new Date('2024-12-10T00:00:00.000Z'),
    variants: [
      { name: '100g', options: { size: '100g' }, price: 240000, stock: 30, sku: 'CLAY-100' },
    ],
  },
  {
    slug: 'nourishing-beard-oil',
    title: 'Nourishing Beard Oil',
    category: 'grooming',
    collection: 'beard',
    excerpt: 'Dưỡng râu mềm mượt, giảm ngứa.',
    description:
      'Dầu dưỡng râu chiết xuất jojoba và argan giúp làm mềm, giảm ngứa và kích thích râu phát triển khỏe mạnh. Thẩm thấu nhanh, không nhờn rít.',
    images: ['/images/grooming-beard-oil.png'],
    basePrice: 180000,
    compareAtPrice: 210000,
    featured: false,
    status: 'active',
    tags: ['beard', 'dưỡng'],
    rating: 4.6,
    reviewCount: 54,
    createdAt: new Date('2025-01-05T00:00:00.000Z'),
    variants: [
      { name: '30ml', options: { size: '30ml' }, price: 180000, compareAtPrice: 210000, stock: 25, sku: 'BRD-30' },
      { name: '50ml', options: { size: '50ml' }, price: 250000, stock: 0, sku: 'BRD-50' },
    ],
  },
  {
    slug: 'daily-clean-shampoo',
    title: 'Daily Clean Shampoo',
    category: 'grooming',
    collection: 'wash',
    excerpt: 'Dầu gội hằng ngày, sạch sâu, dịu nhẹ.',
    description:
      'Dầu gội làm sạch sâu bụi bẩn và dầu thừa mà không làm khô da đầu. Công thức dịu nhẹ dùng được hằng ngày, hương bạc hà mát lạnh.',
    images: ['/images/grooming-shampoo.png'],
    basePrice: 160000,
    featured: false,
    status: 'active',
    tags: ['gội', 'daily'],
    rating: 4.5,
    reviewCount: 38,
    createdAt: new Date('2025-01-20T00:00:00.000Z'),
    variants: [
      { name: '250ml', options: { size: '250ml' }, price: 160000, stock: 60, sku: 'SHP-250' },
    ],
  },
  {
    slug: 'barber-comb-brush-set',
    title: 'Comb & Brush Set',
    category: 'grooming',
    collection: 'tools',
    excerpt: 'Bộ lược và bàn chải tạo kiểu chuyên nghiệp.',
    description:
      'Bộ combo lược carbon chống tĩnh điện và bàn chải lông tự nhiên, giúp tạo kiểu và làm mượt tóc như tại tiệm.',
    images: ['/images/grooming-comb.png'],
    basePrice: 150000,
    featured: false,
    status: 'active',
    tags: ['tools', 'combo'],
    rating: 4.9,
    reviewCount: 71,
    createdAt: new Date('2024-10-15T00:00:00.000Z'),
    variants: [
      { name: 'Bộ tiêu chuẩn', options: { type: 'standard' }, price: 150000, stock: 40, sku: 'CMB-STD' },
    ],
  },
  {
    slug: 'complete-grooming-kit',
    title: 'Complete Grooming Kit',
    category: 'grooming',
    collection: 'kit',
    excerpt: 'Bộ quà chăm sóc trọn gói cho quý ông.',
    description:
      'Bộ quà tặng gồm pomade, dầu dưỡng râu và lược, đóng hộp sang trọng — món quà hoàn hảo cho phái mạnh.',
    images: ['/images/grooming-kit.png'],
    basePrice: 520000,
    compareAtPrice: 620000,
    featured: true,
    status: 'active',
    tags: ['gift', 'combo', 'sale'],
    rating: 4.9,
    reviewCount: 44,
    createdAt: new Date('2025-02-01T00:00:00.000Z'),
    variants: [
      { name: 'Gift Box', options: { type: 'box' }, price: 520000, compareAtPrice: 620000, stock: 12, sku: 'KIT-BOX' },
    ],
  },
  {
    slug: 'toto-heavyweight-tee',
    title: 'Heavyweight Logo Tee',
    category: 'merchandise',
    collection: 'tee',
    excerpt: 'Áo thun cotton dày, form regular, logo ngực.',
    description:
      'Áo thun cotton 250gsm dày dặn, form regular streetwear, in logo Toto tối giản ở ngực. Bền màu, thoáng mát, mặc quanh năm.',
    images: ['/images/merch-tee.png'],
    basePrice: 320000,
    featured: true,
    status: 'active',
    tags: ['tee', 'cotton', 'unisex'],
    rating: 4.7,
    reviewCount: 98,
    createdAt: new Date('2024-12-01T00:00:00.000Z'),
    variants: [
      { name: 'Đen / S', options: { color: 'Đen', size: 'S' }, price: 320000, stock: 20, sku: 'TEE-BK-S' },
      { name: 'Đen / M', options: { color: 'Đen', size: 'M' }, price: 320000, stock: 35, sku: 'TEE-BK-M' },
      { name: 'Đen / L', options: { color: 'Đen', size: 'L' }, price: 320000, stock: 28, sku: 'TEE-BK-L' },
      { name: 'Rêu / M', options: { color: 'Xanh rêu', size: 'M' }, price: 340000, stock: 0, sku: 'TEE-GR-M' },
    ],
  },
  {
    slug: 'corduroy-logo-cap',
    title: 'Corduroy Logo Cap',
    category: 'merchandise',
    collection: 'cap',
    excerpt: 'Nón nhung tăm màu rêu, logo thêu.',
    description:
      'Nón lưỡi trai chất liệu nhung tăm màu xanh rêu đặc trưng, logo thêu nổi, khoá điều chỉnh kim loại. Phụ kiện hoàn thiện set đồ.',
    images: ['/images/merch-cap.png'],
    basePrice: 250000,
    featured: true,
    status: 'active',
    tags: ['cap', 'accessory'],
    rating: 4.8,
    reviewCount: 63,
    createdAt: new Date('2025-01-12T00:00:00.000Z'),
    variants: [
      { name: 'Xanh rêu', options: { color: 'Xanh rêu' }, price: 250000, stock: 33, sku: 'CAP-GR' },
      { name: 'Đen', options: { color: 'Đen' }, price: 250000, stock: 21, sku: 'CAP-BK' },
    ],
  },
  {
    slug: 'essential-hoodie',
    title: 'Essential Hoodie',
    category: 'merchandise',
    collection: 'hoodie',
    excerpt: 'Hoodie nỉ dày, in lưng tối giản.',
    description:
      'Hoodie nỉ bông 380gsm giữ ấm tốt, form oversized nhẹ, in lưng tối giản. Item chủ lực cho mùa lạnh.',
    images: ['/images/merch-hoodie.png'],
    basePrice: 590000,
    featured: false,
    status: 'active',
    tags: ['hoodie', 'winter'],
    rating: 4.9,
    reviewCount: 41,
    createdAt: new Date('2025-02-10T00:00:00.000Z'),
    variants: [
      { name: 'Đen / M', options: { color: 'Đen', size: 'M' }, price: 590000, stock: 14, sku: 'HOD-M' },
      { name: 'Đen / L', options: { color: 'Đen', size: 'L' }, price: 590000, stock: 9, sku: 'HOD-L' },
      { name: 'Đen / XL', options: { color: 'Đen', size: 'XL' }, price: 590000, stock: 6, sku: 'HOD-XL' },
    ],
  },
  {
    slug: 'canvas-tote-bag',
    title: 'Canvas Tote Bag',
    category: 'merchandise',
    collection: 'bag',
    excerpt: 'Túi canvas in lụa logo, bền chắc.',
    description:
      'Túi tote vải canvas dày, in lụa logo màu rêu, quai chắc chắn — đựng đồ mỗi ngày hoặc làm phụ kiện phối đồ.',
    images: ['/images/merch-tote.png'],
    basePrice: 180000,
    featured: false,
    status: 'active',
    tags: ['bag', 'canvas'],
    rating: 4.6,
    reviewCount: 29,
    createdAt: new Date('2025-01-25T00:00:00.000Z'),
    variants: [
      { name: 'Kem', options: { color: 'Kem' }, price: 180000, stock: 50, sku: 'TOT-NT' },
    ],
  },
  {
    slug: 'chore-work-jacket',
    title: 'Chore Work Jacket',
    category: 'merchandise',
    collection: 'jacket',
    excerpt: 'Áo khoác chore coat vải bố màu rêu.',
    description:
      'Chore jacket vải bố cotton màu xanh rêu, nhiều túi hộp tiện dụng, form vừa vặn, phối được nhiều phong cách.',
    images: ['/images/merch-jacket.png'],
    basePrice: 780000,
    featured: true,
    status: 'active',
    tags: ['jacket', 'workwear', 'limited'],
    rating: 5,
    reviewCount: 17,
    createdAt: new Date('2025-02-18T00:00:00.000Z'),
    variants: [
      { name: 'Rêu / M', options: { color: 'Xanh rêu', size: 'M' }, price: 780000, stock: 7, sku: 'JKT-M' },
      { name: 'Rêu / L', options: { color: 'Xanh rêu', size: 'L' }, price: 780000, stock: 4, sku: 'JKT-L' },
    ],
  },
  {
    slug: 'ribbed-crew-socks',
    title: 'Ribbed Crew Socks',
    category: 'merchandise',
    collection: 'socks',
    excerpt: 'Tất cổ trung dệt logo, cotton co giãn.',
    description:
      'Tất cổ trung chất cotton co giãn, gân dệt và logo nhỏ ở cổ. Bán theo set 2 đôi đen và rêu.',
    images: ['/images/merch-socks.png'],
    basePrice: 90000,
    featured: false,
    status: 'active',
    tags: ['socks', 'set'],
    rating: 4.4,
    reviewCount: 22,
    createdAt: new Date('2025-01-30T00:00:00.000Z'),
    variants: [
      { name: 'Set 2 đôi', options: { pack: '2 đôi' }, price: 90000, stock: 80, sku: 'SCK-2' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding products...');
  
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.title,
        excerpt: p.excerpt,
        description: p.description,
        images: p.images,
        category: p.category,
        collection: p.collection,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice || null,
        featured: p.featured,
        status: p.status,
        tags: p.tags,
        rating: p.rating,
        reviewCount: p.reviewCount,
        seoTitle: p.seoTitle || null,
        seoDescription: p.seoDescription || null,
      },
      create: {
        slug: p.slug,
        name: p.title,
        excerpt: p.excerpt,
        description: p.description,
        images: p.images,
        category: p.category,
        collection: p.collection,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice || null,
        featured: p.featured,
        status: p.status,
        tags: p.tags,
        rating: p.rating,
        reviewCount: p.reviewCount,
        seoTitle: p.seoTitle || null,
        seoDescription: p.seoDescription || null,
        createdAt: p.createdAt,
      },
    });

    for (const v of p.variants as any[]) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { 
          stock: v.stock,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          name: v.name,
          options: v.options,
        },
        create: {
          productId: product.id,
          name: v.name,
          options: v.options,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          stock: v.stock,
          sku: v.sku,
        },
      });
    }
    
    console.log(`  ✅ ${p.title} (${p.variants.length} variants)`);
  }

  console.log('\n🌱 Seeding users...');
  const passwordHash = await bcrypt.hash('123456', 10);
  
  const users = [
    {
      email: 'admin@toto.com',
      password: passwordHash,
      name: 'Toto Admin',
      phone: '0901234567',
      role: 'ADMIN',
    },
    {
      email: 'customer@toto.com',
      password: passwordHash,
      name: 'Nguyen Van Khach',
      phone: '0909876543',
      role: 'CUSTOMER',
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`  ✅ User: ${u.email}`);
  }

  console.log('\n🌱 Seeding promo codes...');
  const promoCodes = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderValue: 200000,
      maxDiscount: 50000,
      usageLimit: 100,
      isActive: true,
    },
    {
      code: 'TOTO50K',
      discountType: 'FIXED',
      discountValue: 50000,
      minOrderValue: 300000,
      maxDiscount: null,
      usageLimit: 50,
      isActive: true,
    }
  ];

  for (const pc of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: pc.code },
      update: pc,
      create: pc,
    });
    console.log(`  ✅ Promo: ${pc.code}`);
  }

  console.log('\n🎉 Seed hoàn tất!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
