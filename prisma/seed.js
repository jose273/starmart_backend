// backend/prisma/seed.js
// Run: npx prisma db seed

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding STARMART database...\n");

  // ── 1. CATEGORIES ──────────────────────────────────────────────────────────
  const categories = await Promise.all(
    ["Electronics", "Sports", "Clothing", "Beauty", "Food"].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  console.log("✅ Categories seeded");

  // ── 2. USERS ───────────────────────────────────────────────────────────────
  const users = [
    { name: "Sam Carter",   email: "cashier@starmart.co.ke", password: "cashier123", role: "cashier" },
    { name: "Maya Reeves",  email: "manager@starmart.co.ke", password: "manager123", role: "manager" },
    { name: "Alex Morgan",  email: "admin@starmart.co.ke",   password: "admin1234",  role: "admin"   },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
  }
  console.log("✅ Users seeded  (cashier / manager / admin)");

  // ── 3. PRODUCTS ────────────────────────────────────────────────────────────
  const products = [
    { name: "Wireless Headphones",    sku: "EL-001", barcode: "4901234000001", emoji: "🎧", price: 89.99,  costPrice: 45.00, stock: 23, minStock: 5,  cat: "Electronics" },
    { name: "USB-C Hub 7-Port",       sku: "EL-002", barcode: "4901234000002", emoji: "🔌", price: 34.99,  costPrice: 14.00, stock: 45, minStock: 10, cat: "Electronics" },
    { name: "Mechanical Keyboard",    sku: "EL-003", barcode: "4901234000003", emoji: "⌨️", price: 129.99, costPrice: 65.00, stock: 12, minStock: 5,  cat: "Electronics" },
    { name: "Bluetooth Speaker",      sku: "EL-004", barcode: "4901234000004", emoji: "🔊", price: 59.99,  costPrice: 28.00, stock: 17, minStock: 5,  cat: "Electronics" },
    { name: "Running Shoes",          sku: "SP-001", barcode: "4901234000005", emoji: "👟", price: 79.99,  costPrice: 38.00, stock: 18, minStock: 5,  cat: "Sports"      },
    { name: "Yoga Mat Premium",       sku: "SP-002", barcode: "4901234000006", emoji: "🧘", price: 29.99,  costPrice: 12.00, stock: 30, minStock: 8,  cat: "Sports"      },
    { name: "Stainless Water Bottle", sku: "SP-003", barcode: "4901234000007", emoji: "💧", price: 19.99,  costPrice: 7.00,  stock: 55, minStock: 10, cat: "Sports"      },
    { name: "Slim Fit Jeans",         sku: "CL-001", barcode: "4901234000008", emoji: "👖", price: 49.99,  costPrice: 22.00, stock: 25, minStock: 8,  cat: "Clothing"    },
    { name: "Graphic Tee",            sku: "CL-002", barcode: "4901234000009", emoji: "👕", price: 24.99,  costPrice: 9.00,  stock: 40, minStock: 10, cat: "Clothing"    },
    { name: "Winter Jacket",          sku: "CL-003", barcode: "4901234000010", emoji: "🧥", price: 149.99, costPrice: 72.00, stock: 8,  minStock: 3,  cat: "Clothing"    },
    { name: "Vitamin C Serum",        sku: "BT-001", barcode: "4901234000011", emoji: "✨", price: 39.99,  costPrice: 15.00, stock: 20, minStock: 5,  cat: "Beauty"      },
    { name: "Lip Balm Gift Set",      sku: "BT-002", barcode: "4901234000012", emoji: "💋", price: 12.99,  costPrice: 4.50,  stock: 60, minStock: 15, cat: "Beauty"      },
    { name: "Granola Bar 6-Pack",     sku: "FD-001", barcode: "4901234000013", emoji: "🍫", price: 8.99,   costPrice: 3.50,  stock: 100,minStock: 20, cat: "Food"        },
    { name: "Green Tea Box",          sku: "FD-002", barcode: "4901234000014", emoji: "🍵", price: 6.49,   costPrice: 2.00,  stock: 80, minStock: 20, cat: "Food"        },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name, sku: p.sku, barcode: p.barcode, emoji: p.emoji,
        price: p.price, costPrice: p.costPrice, stock: p.stock, minStock: p.minStock,
        categoryId: catMap[p.cat],
      },
    });
  }
  console.log("✅ Products seeded  (14 items across 5 categories)");

  // ── 4. CUSTOMERS ───────────────────────────────────────────────────────────
  const customers = [
    { name: "Alice Johnson", email: "alice@mail.com", phone: "+1-555-0101", points: 240, totalSpent: 480.50, totalOrders: 8  },
    { name: "Bob Williams",  email: "bob@mail.com",   phone: "+1-555-0102", points: 120, totalSpent: 240.00, totalOrders: 4  },
    { name: "Carol Davis",   email: "carol@mail.com", phone: "+1-555-0103", points: 380, totalSpent: 760.75, totalOrders: 14 },
    { name: "David Lee",     email: "david@mail.com", phone: "+1-555-0104", points: 55,  totalSpent: 110.00, totalOrders: 2  },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: c,
    });
  }
  console.log("✅ Customers seeded  (4 demo customers)");

  // ── 5. COUPONS ─────────────────────────────────────────────────────────────
  const coupons = [
    { code: "SAVE10",  discountPct: 10 },
    { code: "SAVE20",  discountPct: 20 },
    { code: "VIP15",   discountPct: 15 },
    { code: "FLASH5",  discountPct: 5  },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log("✅ Coupons seeded  (SAVE10, SAVE20, VIP15, FLASH5)");

  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────────");
  console.log("Demo login credentials:");
  console.log("  cashier@starmart.co.ke  /  cashier123  [Cashier]");
  console.log("  manager@starmart.co.ke  /  manager123  [Manager]");
  console.log("  admin@starmart.co.ke    /  admin1234   [Admin]");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });