import { PrismaClient, Role, PurchaseStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.$transaction([
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.rating.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.product.deleteMany(),
    prisma.farmer.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Helper function to generate random dates within the last 12 months
  function randomDateWithinLastYear() {
    const today = new Date();
    const pastYear = new Date(today.setFullYear(today.getFullYear() - 1));
    return faker.date.between({ from: pastYear, to: new Date() });
  }

  console.log("📝 Creating admin user...");
  const adminUser = await prisma.user.create({
    data: {
      authId: `user_${faker.string.alphanumeric(24)}`,
      role: Role.ADMIN,
    },
  });

  console.log("👨‍🌾 Creating farmers...");
  const farmers = await Promise.all(
    Array(20)
      .fill(null)
      .map(async () => {
        const farmerId = `user_${faker.string.alphanumeric(24)}`;
        await prisma.user.create({
          data: {
            authId: farmerId,
            role: Role.FARMER,
          },
        });

        return prisma.farmer.create({
          data: {
            id: farmerId,
            name: faker.person.fullName(),
            description: faker.lorem.paragraph(),
            location: faker.location.streetAddress(),
          },
        });
      }),
  );

  console.log("👥 Creating regular users...");
  const users = await Promise.all(
    Array(50)
      .fill(null)
      .map(async () => {
        return prisma.user.create({
          data: {
            authId: `user_${faker.string.alphanumeric(24)}`,
            role: Role.USER,
          },
        });
      }),
  );

  console.log("🥕 Creating products...");
  const products = await Promise.all(
    Array(100)
      .fill(null)
      .map(async () => {
        const farmer = faker.helpers.arrayElement(farmers);
        return prisma.product.create({
          data: {
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.number.float({ min: 10, max: 1000 }),
            stock: faker.number.int({ min: 0, max: 1000 }),
            unit: faker.helpers.arrayElement(["kg", "g", "pieces", "bunches"]),
            farmers: {
              connect: { id: farmer.id },
            },
            imageUrl: faker.image.url(),
          },
        });
      }),
  );

  console.log("🛒 Creating carts and cart items...");
  await Promise.all(
    users.slice(0, 25).map(async (user) => {
      await prisma.cart.create({
        data: {
          userId: user.id,
          items: {
            create: faker.helpers
              .arrayElements(products, { min: 1, max: 4 })
              .map((product) => ({
                productId: product.id,
                quantity: faker.number.int({ min: 1, max: 5 }),
              })),
          },
        },
      });
    }),
  );

  console.log("💳 Creating purchases...");
  const purchases = await Promise.all(
    Array(300)
      .fill(null)
      .map(async () => {
        const product = faker.helpers.arrayElement(products);
        const user = faker.helpers.arrayElement(users);
        const quantity = faker.number.int({ min: 1, max: 5 });

        return prisma.purchase.create({
          data: {
            userId: user.id,
            productId: product.id,
            quantity,
            amount: Number(product.price) * quantity,
            status: faker.helpers.arrayElement(Object.values(PurchaseStatus)),
            stripePaymentId: faker.string.alphanumeric(24),
            createdAt: randomDateWithinLastYear(),
          },
        });
      }),
  );

  console.log("⭐ Creating ratings...");
  for (const purchase of purchases.filter(
    (p) => p.status === PurchaseStatus.COMPLETED,
  )) {
    const existingRating = await prisma.rating.findFirst({
      where: {
        userId: purchase.userId,
        productId: purchase.productId,
      },
    });

    if (!existingRating) {
      await prisma.rating.create({
        data: {
          userId: purchase.userId,
          productId: purchase.productId,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
        },
      });
    }
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
