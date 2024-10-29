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
    prisma.book.deleteMany(),
    prisma.author.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.genre.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("📝 Creating admin user...");
  // Create admin user with mock Clerk authId
  const adminUser = await prisma.user.create({
    data: {
      authId: `user_${faker.string.alphanumeric(24)}`, // Mock Clerk user ID format
      role: Role.ADMIN,
    },
  });

  console.log("👥 Creating regular users...");
  // Create regular users
  const users = await Promise.all(
    Array(10)
      .fill(null)
      .map(async () => {
        return prisma.user.create({
          data: {
            authId: `user_${faker.string.alphanumeric(24)}`, // Mock Clerk user ID format
            role: Role.USER,
          },
        });
      }),
  );

  console.log("✍️ Creating authors...");
  // Create authors
  const authors = await Promise.all(
    Array(20)
      .fill(null)
      .map(() => {
        return prisma.author.create({
          data: {
            name: faker.person.fullName(),
          },
        });
      }),
  );

  console.log("🏷️ Creating tags...");
  // Create tags
  const tagNames = [
    "Bestseller",
    "New Release",
    "Award Winner",
    "Classic",
    "Featured",
    "Popular",
    "Limited Time",
    "Editor's Choice",
  ];
  const tags = await Promise.all(
    tagNames.map((name) => {
      return prisma.tag.create({
        data: { name },
      });
    }),
  );

  console.log("📚 Creating genres...");
  // Create genres
  const genreNames = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Biography",
    "History",
    "Technology",
    "Business",
    "Self-Help",
  ];
  const genres = await Promise.all(
    genreNames.map((name) => {
      return prisma.genre.create({
        data: { name },
      });
    }),
  );

  console.log("📖 Creating books...");
  // Create books
  const books = await Promise.all(
    Array(50)
      .fill(null)
      .map(async () => {
        // Random selection of related entities
        const bookAuthors = faker.helpers.arrayElements(authors, {
          min: 1,
          max: 3,
        });
        const bookTags = faker.helpers.arrayElements(tags, { min: 1, max: 4 });
        const bookGenres = faker.helpers.arrayElements(genres, {
          min: 1,
          max: 2,
        });

        return prisma.book.create({
          data: {
            title: faker.lorem.words({ min: 2, max: 5 }),
            description: faker.lorem.paragraphs(3),
            price: faker.number.float({
              min: 4.99,
              max: 49.99,
              fractionDigits: 2,
            }),
            pdfUrl: faker.internet.url(), // In production, this would be a real PDF URL
            thumbnailUrl: faker.image.url(), // In production, this would be a real image URL
            publisher: faker.company.name(),
            rating: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
            releaseDate: faker.date.past(),
            authors: {
              connect: bookAuthors.map((author) => ({ id: author.id })),
            },
            tags: {
              connect: bookTags.map((tag) => ({ id: tag.id })),
            },
            genres: {
              connect: bookGenres.map((genre) => ({ id: genre.id })),
            },
          },
        });
      }),
  );

  console.log("🛒 Creating carts and cart items...");
  // Create carts and cart items for some users
  await Promise.all(
    users.slice(0, 5).map(async (user) => {
      const cart = await prisma.cart.create({
        data: {
          userId: user.id,
          items: {
            create: faker.helpers
              .arrayElements(books, { min: 1, max: 4 })
              .map((book) => ({
                bookId: book.id,
              })),
          },
        },
      });
    }),
  );

  console.log("💳 Creating purchases...");
  // Create purchases
  const purchases = await Promise.all(
    Array(100)
      .fill(null)
      .map(async () => {
        const book = faker.helpers.arrayElement(books);
        const user = faker.helpers.arrayElement(users);

        return prisma.purchase.create({
          data: {
            userId: user.id,
            bookId: book.id,
            amount: book.price,
            status: faker.helpers.arrayElement(Object.values(PurchaseStatus)),
            stripePaymentId: faker.string.alphanumeric(24),
          },
        });
      }),
  );

  console.log("⭐ Creating ratings...");

  // Create ratings for purchased books
  for (const purchase of purchases.filter(
    (p) => p.status === PurchaseStatus.COMPLETED,
  )) {
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_bookId: {
          userId: purchase.userId,
          bookId: purchase.bookId,
        },
      },
    });

    if (!existingRating) {
      await prisma.rating.create({
        data: {
          userId: purchase.userId,
          bookId: purchase.bookId,
          rating: faker.number.int({ min: 1, max: 5 }),
        },
      });
    }
  }

  // Update book ratings based on actual ratings
  console.log("📊 Updating book average ratings...");
  for (const book of books) {
    const ratings = await prisma.rating.findMany({
      where: { bookId: book.id },
    });

    if (ratings.length > 0) {
      const averageRating =
        ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
      await prisma.book.update({
        where: { id: book.id },
        data: { rating: averageRating },
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
