const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({ include: { variants: true } });
  let code = fs.readFileSync('../toto-barbershop-v0/src/data/products.ts', 'utf8');
  
  for (const p of products) {
    for (const v of p.variants) {
      // Find the variant in the code by its sku
      const skuRegex = new RegExp(`{ id: '([^']+)',(.*?)sku: '${v.sku}' }`, 'g');
      code = code.replace(skuRegex, `{ id: ${v.id},$2sku: '${v.sku}' }`);
    }
    
    // Replace product id
    // We can find it by looking for title: 'p.name'
    const titleRegex = new RegExp(`id: '([^']+)',\\s*slug: '([^']+)',\\s*title: '${p.name}'`, 'g');
    code = code.replace(titleRegex, `id: ${p.id},\n    slug: '$2',\n    title: '${p.name}'`);
  }
  
  fs.writeFileSync('../toto-barbershop-v0/src/data/products.ts', code);
  console.log('✅ Updated products.ts with integer IDs from DB!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
