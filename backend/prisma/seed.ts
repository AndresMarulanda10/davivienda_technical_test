import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const SALT_ROUNDS = 12;

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics' },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: { name: 'Clothing', slug: 'clothing' },
    }),
    prisma.category.upsert({
      where: { slug: 'home-kitchen' },
      update: {},
      create: { name: 'Home & Kitchen', slug: 'home-kitchen' },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: { name: 'Sports', slug: 'sports' },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: { name: 'Books', slug: 'books' },
    }),
  ]);

  const [electronics, clothing, homeKitchen, sports, books] = categories;

  // Users
  const adminPasswordHash = await bcrypt.hash('Admin@12345', SALT_ROUNDS);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'admin@davivienda.com' },
    update: {},
    create: {
      email: 'admin@davivienda.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Davivienda',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@davivienda.com' },
    update: {},
    create: {
      email: 'customer@davivienda.com',
      passwordHash: customerPasswordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  });

  // Products
  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      description:
        'Over-ear headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
      price: 299.99,
      stock: 45,
      imageUrl: 'https://placehold.co/600x400?text=Headphones',
      categoryId: electronics.id,
    },
    {
      name: 'Mechanical Keyboard',
      description:
        'Tenkeyless mechanical keyboard with Cherry MX Blue switches, RGB backlight, and aluminum frame.',
      price: 149.99,
      stock: 30,
      imageUrl: 'https://placehold.co/600x400?text=Keyboard',
      categoryId: electronics.id,
    },
    {
      name: '4K Webcam',
      description:
        'Ultra-HD webcam with auto-focus, built-in microphone, and 90-degree field of view.',
      price: 89.99,
      stock: 60,
      imageUrl: 'https://placehold.co/600x400?text=Webcam',
      categoryId: electronics.id,
    },
    {
      name: 'Portable Power Bank 20000mAh',
      description:
        'High-capacity power bank with USB-C PD 45W fast charging and dual USB-A outputs.',
      price: 59.99,
      stock: 80,
      imageUrl: 'https://placehold.co/600x400?text=PowerBank',
      categoryId: electronics.id,
    },
    {
      name: 'Merino Wool Sweater',
      description:
        'Classic crewneck sweater in 100% merino wool. Naturally temperature-regulating and itch-free.',
      price: 119.00,
      stock: 50,
      imageUrl: 'https://placehold.co/600x400?text=Sweater',
      categoryId: clothing.id,
    },
    {
      name: 'Running Shorts',
      description:
        'Lightweight 5-inch running shorts with built-in liner and back zip pocket.',
      price: 39.99,
      stock: 75,
      imageUrl: 'https://placehold.co/600x400?text=Shorts',
      categoryId: clothing.id,
    },
    {
      name: 'Waterproof Hiking Jacket',
      description:
        '3-layer Gore-Tex jacket with pit zips, adjustable hood, and packable design.',
      price: 249.00,
      stock: 20,
      imageUrl: 'https://placehold.co/600x400?text=Jacket',
      categoryId: clothing.id,
    },
    {
      name: 'Cast Iron Skillet 12"',
      description:
        'Pre-seasoned cast iron skillet compatible with all cooktops including induction. Oven safe to 500°F.',
      price: 44.99,
      stock: 35,
      imageUrl: 'https://placehold.co/600x400?text=Skillet',
      categoryId: homeKitchen.id,
    },
    {
      name: 'Pour-Over Coffee Maker',
      description:
        'Borosilicate glass pour-over coffee maker with wood collar and leather tie. Serves 4 cups.',
      price: 29.99,
      stock: 55,
      imageUrl: 'https://placehold.co/600x400?text=CoffeeMaker',
      categoryId: homeKitchen.id,
    },
    {
      name: 'Yoga Mat',
      description:
        '6mm non-slip yoga mat with alignment lines, carrying strap, and eco-friendly TPE material.',
      price: 49.99,
      stock: 100,
      imageUrl: 'https://placehold.co/600x400?text=YogaMat',
      categoryId: sports.id,
    },
    {
      name: 'Resistance Bands Set',
      description:
        'Set of 5 resistance bands in varying levels (10–50 lbs) with handles, ankle straps, and door anchor.',
      price: 34.99,
      stock: 90,
      imageUrl: 'https://placehold.co/600x400?text=ResistanceBands',
      categoryId: sports.id,
    },
    {
      name: 'Clean Code — Robert C. Martin',
      description:
        'A handbook of agile software craftsmanship covering naming, functions, comments, formatting, and more.',
      price: 39.99,
      stock: 40,
      imageUrl: 'https://placehold.co/600x400?text=CleanCode',
      categoryId: books.id,
    },
    {
      name: 'Designing Data-Intensive Applications',
      description:
        'Deep dive into the principles behind reliable, scalable, and maintainable data systems.',
      price: 54.99,
      stock: 25,
      imageUrl: 'https://placehold.co/600x400?text=DDIA',
      categoryId: books.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Seed completed successfully.');
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Users: 2 (admin@davivienda.com, customer@davivienda.com)`);
  console.log(`  Products: ${products.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
