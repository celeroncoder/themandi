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

  console.log("👥 Creating regular users...");
  const users = await Promise.all(
    Array(50) // Increased to generate more users
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

  console.log("✍️ Creating authors...");
  const authors = await Promise.all(
    Array(50) // Increased to generate more authors
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
  const books = await Promise.all(
    Array(200) // Increased to generate more books
      .fill(null)
      .map(async () => {
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
            pdfUrl: faker.internet.url(),
            thumbnailUrl: faker.image.url(),
            publisher: faker.company.name(),
            rating: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
            releaseDate: randomDateWithinLastYear(), // Spread over last 12 months
            authors: {
              connect: bookAuthors.map((author) => ({ id: author.id })),
            },
            tags: { connect: bookTags.map((tag) => ({ id: tag.id })) },
            genres: { connect: bookGenres.map((genre) => ({ id: genre.id })) },
          },
        });
      }),
  );

  console.log("🛒 Creating carts and cart items...");
  await Promise.all(
    users.slice(0, 25).map(async (user) => {
      // Increased number of carts
      await prisma.cart.create({
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
  const purchases = await Promise.all(
    Array(300) // Increased to generate more purchases
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
            createdAt: randomDateWithinLastYear(), // Purchases spread over last 12 months
          },
        });
      }),
  );

  console.log("⭐ Creating ratings...");
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
