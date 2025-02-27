import { PrismaClient, Role } from "@prisma/client";
import { faker, en_IN, Faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configure faker to use Indian locale
const fakerIN = new Faker({ locale: [en_IN] });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Empty the database first
  console.log("🧹 Cleaning existing database records...");
  try {
    console.log("  - Deleting product tags relations...");
    await prisma.$executeRaw`TRUNCATE TABLE "_ProductToTag" CASCADE;`;

    console.log("  - Deleting products...");
    await prisma.product.deleteMany();

    console.log("  - Deleting tags...");
    await prisma.tag.deleteMany();

    console.log("  - Deleting categories...");
    await prisma.category.deleteMany();

    console.log("  - Deleting farmers...");
    await prisma.farmer.deleteMany();

    console.log("  - Deleting users...");
    await prisma.user.deleteMany();

    console.log("✅ Database cleaned successfully!");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    throw error;
  }

  // Define categories for Indian agricultural products
  const categories = [
    { name: "Vegetables" },
    { name: "Fruits" },
    { name: "Grains" },
    { name: "Spices" },
    { name: "Dairy" },
    { name: "Organic" },
  ];

  // Define tags for products
  const tags = [
    "Organic",
    "Fresh",
    "Seasonal",
    "Traditional",
    "Pesticide-free",
    "Farm-direct",
    "Artisanal",
    "Homemade",
    "Premium",
    "Budget-friendly",
    "Chemical-free",
    "Eco-friendly",
    "Sustainable",
    "Handpicked",
    "Local",
  ];

  // Indian product names by category
  const productsByCategory = {
    Vegetables: [
      "Bhindi (Okra)",
      "Baingan (Eggplant)",
      "Aloo (Potato)",
      "Pyaaz (Onion)",
      "Tamatar (Tomato)",
      "Gobhi (Cauliflower)",
      "Matar (Peas)",
      "Gajar (Carrot)",
      "Palak (Spinach)",
      "Kaddu (Pumpkin)",
      "Turai (Ridge Gourd)",
      "Lauki (Bottle Gourd)",
      "Shimla Mirch (Capsicum)",
      "Karela (Bitter Gourd)",
      "Mooli (Radish)",
    ],
    Fruits: [
      "Aam (Mango)",
      "Kela (Banana)",
      "Seb (Apple)",
      "Anaar (Pomegranate)",
      "Papita (Papaya)",
      "Jamun",
      "Amrood (Guava)",
      "Narangi (Orange)",
      "Chikoo (Sapodilla)",
      "Lychee",
      "Nashpati (Pear)",
      "Tarbooz (Watermelon)",
      "Kharbuja (Muskmelon)",
      "Sitafal (Custard Apple)",
      "Angoor (Grapes)",
    ],
    Grains: [
      "Chawal (Rice)",
      "Gehun (Wheat)",
      "Bajra (Pearl Millet)",
      "Jowar (Sorghum)",
      "Makka (Corn)",
      "Ragi (Finger Millet)",
      "Chana (Chickpeas)",
      "Moong Dal (Green Gram)",
      "Masoor Dal (Red Lentils)",
      "Toor Dal (Pigeon Peas)",
      "Urad Dal (Black Gram)",
      "Rajma (Kidney Beans)",
      "Jau (Barley)",
      "Soya Bean",
      "Kulthi (Horse Gram)",
    ],
    Spices: [
      "Haldi (Turmeric)",
      "Mirch (Chili)",
      "Jeera (Cumin)",
      "Dhania (Coriander)",
      "Ilaychi (Cardamom)",
      "Lavang (Clove)",
      "Dalchini (Cinnamon)",
      "Kali Mirch (Black Pepper)",
      "Ajwain (Carom Seeds)",
      "Saunf (Fennel)",
      "Methi (Fenugreek)",
      "Hing (Asafoetida)",
      "Kesar (Saffron)",
      "Jaiphal (Nutmeg)",
      "Tej Patta (Bay Leaf)",
    ],
    Dairy: [
      "Desi Ghee",
      "Dahi (Yogurt)",
      "Paneer",
      "Makhan (Butter)",
      "Chaas (Buttermilk)",
      "Lassi",
      "Khoya",
      "Shrikhand",
      "Mawa",
      "Cheese",
      "Malai (Cream)",
      "Chhachh",
      "Mishti Doi",
      "Kheer",
      "Basundi",
    ],
    Organic: [
      "Organic Brown Rice",
      "Organic Jaggery",
      "Organic Honey",
      "Organic Coconut Oil",
      "Organic Ghee",
      "Organic Palm Sugar",
      "Organic Millets",
      "Organic Flours",
      "Organic Tea",
      "Organic Coffee",
      "Organic Spice Mixes",
      "Organic Dry Fruits",
      "Organic Seeds",
      "Organic Nuts",
      "Organic Pulses",
    ],
  };

  // Indian farmer names and locations
  const indianFarmerNames = [
    "Rajesh Patel",
    "Suman Singh",
    "Mohammed Khan",
    "Lakshmi Devi",
    "Arjun Reddy",
    "Priya Sharma",
    "Ramu Yadav",
    "Anita Kumari",
    "Suresh Gupta",
    "Geeta Verma",
    "Prakash Mishra",
    "Kavita Joshi",
    "Ramesh Kumar",
    "Sunita Devi",
    "Vijay Rao",
    "Meena Agarwal",
    "Gopal Krishnan",
    "Sarla Devi",
    "Mohan Lal",
    "Deepa Nair",
  ];

  const indianLocations = [
    "Amritsar, Punjab",
    "Jaipur, Rajasthan",
    "Lucknow, Uttar Pradesh",
    "Patna, Bihar",
    "Nashik, Maharashtra",
    "Coimbatore, Tamil Nadu",
    "Kochi, Kerala",
    "Surat, Gujarat",
    "Indore, Madhya Pradesh",
    "Guntur, Andhra Pradesh",
    "Shimla, Himachal Pradesh",
    "Silchar, Assam",
    "Ranchi, Jharkhand",
    "Bhuj, Gujarat",
    "Mangalore, Karnataka",
    "Bhubaneswar, Odisha",
    "Dehradun, Uttarakhand",
    "Siliguri, West Bengal",
    "Guwahati, Assam",
    "Varanasi, Uttar Pradesh",
  ];

  console.log("🌿 Creating product categories...");
  const createdCategories = [];
  for (const category of categories) {
    console.log(`  - Creating category: ${category.name}`);
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
      },
    });
    createdCategories.push(createdCategory);
    console.log(
      `    ✓ Created category: ${createdCategory.name} (ID: ${createdCategory.id})`,
    );
  }
  console.log(`✅ Created ${createdCategories.length} categories!`);

  console.log("🏷️ Creating product tags...");
  const createdTags = [];
  for (const tag of tags) {
    console.log(`  - Creating tag: ${tag}`);
    const createdTag = await prisma.tag.create({
      data: {
        name: tag,
      },
    });
    createdTags.push(createdTag);
    console.log(`    ✓ Created tag: ${createdTag.name} (ID: ${createdTag.id})`);
  }
  console.log(`✅ Created ${createdTags.length} tags!`);

  console.log("👨‍🌾 Creating Indian farmers...");
  const farmers = [];
  for (let i = 0; i < 20; i++) {
    const farmerId = `user_${faker.string.alphanumeric(24)}`;
    console.log(
      `  - Creating farmer: ${indianFarmerNames[i]} (ID: ${farmerId})`,
    );

    console.log(`    - Creating user record...`);
    await prisma.user.create({
      data: {
        authId: farmerId,
        role: Role.FARMER,
      },
    });

    console.log(`    - Creating farmer profile...`);
    const farmer = await prisma.farmer.create({
      data: {
        id: farmerId,
        name: indianFarmerNames[i]!,
        description: `${indianFarmerNames[i]!.split(" ")[0]} is a ${faker.number.int({ min: 5, max: 30 })} year veteran in farming, specializing in traditional ${faker.helpers.arrayElement(["organic", "sustainable", "chemical-free", "eco-friendly"])} farming methods passed down through generations.`,
        location: indianLocations[i]!,
      },
    });
    farmers.push(farmer);
    console.log(`    ✓ Created farmer: ${farmer.name} from ${farmer.location}`);
  }
  console.log(`✅ Created ${farmers.length} farmers!`);

  console.log("🥕 Creating Indian agricultural products...");

  // Limit the number of products to avoid potential timeouts
  const MAX_PRODUCTS = 30; // Adjust this number as needed
  const BATCH_SIZE = 5; // Number of products to create in parallel

  // Prepare all product data for creation
  const productCreationTasks = [];
  let productCount = 0;
  let totalProducts = 0;

  // Calculate total products for progress reporting
  for (const category of createdCategories) {
    const productsInCategory =
      productsByCategory[category.name as keyof typeof productsByCategory] ||
      [];
    totalProducts += productsInCategory.length;
  }

  console.log(`  - Planning to create ${totalProducts} products total`);

  // Prepare product metadata for logging separately from product data
  const productMetadata = new Map();

  // Prepare all product creation tasks
  for (const category of createdCategories) {
    console.log(`  - Preparing products for category: ${category.name}`);
    const productsInCategory =
      productsByCategory[category.name as keyof typeof productsByCategory] ||
      [];

    for (const productName of productsInCategory) {
      if (productCreationTasks.length >= MAX_PRODUCTS) {
        console.log(
          `  ⚠️ Reached maximum product limit (${MAX_PRODUCTS}). Stopping product preparation.`,
        );
        break;
      }

      productCount++;
      console.log(
        `    - Preparing product ${productCount}/${totalProducts}: ${productName}`,
      );

      const farmer = faker.helpers.arrayElement(farmers);
      const productTags = faker.helpers.arrayElements(createdTags, {
        min: 1,
        max: 4,
      });
      const priceValue = faker.number.float({ min: 25, max: 800 });
      const stockValue = faker.number.int({ min: 5, max: 1000 });
      const unitValue = faker.helpers.arrayElement([
        "kg",
        "g",
        "pieces",
        "bunches",
        "packets",
      ]);

      const productData = {
        title: productName,
        description: `Premium quality ${productName.toLowerCase()} from ${farmer.location}. ${faker.lorem.sentence()}`,
        price: priceValue,
        stock: stockValue,
        unit: unitValue,
        farmers: {
          connect: { id: farmer.id },
        },
        categories: {
          connect: { id: category.id },
        },
        tags: {
          connect: productTags.map((tag) => ({ id: tag.id })),
        },
        imageUrl: faker.image.urlLoremFlickr({ category: "food" }),
      };

      // Store metadata separately for logging
      productMetadata.set(productData, {
        productCount,
        farmerName: farmer.name,
        tagNames: productTags.map((t) => t.name).join(", "),
      });

      productCreationTasks.push(productData);
    }

    if (productCreationTasks.length >= MAX_PRODUCTS) {
      break;
    }
  }

  // Create products in parallel batches
  let createdProductsCount = 0;
  console.log(
    `  - Starting parallel product creation in batches of ${BATCH_SIZE}`,
  );

  for (let i = 0; i < productCreationTasks.length; i += BATCH_SIZE) {
    const batch = productCreationTasks.slice(i, i + BATCH_SIZE);
    console.log(
      `  - Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(productCreationTasks.length / BATCH_SIZE)}`,
    );

    const batchResults = await Promise.all(
      batch.map(async (productData) => {
        // Get metadata from our separate Map
        const meta = productMetadata.get(productData);

        try {
          console.log(
            `    - Creating product ${meta.productCount}/${totalProducts}: ${productData.title}`,
          );
          console.log(`      - Assigning to farmer: ${meta.farmerName}`);
          console.log(`      - Adding tags: ${meta.tagNames}`);
          console.log(
            `      - Price: ₹${productData.price} per ${productData.unit}, Stock: ${productData.stock}`,
          );

          const product = await prisma.product.create({ data: productData });

          console.log(
            `      ✓ Created product: ${product.title} (ID: ${product.id})`,
          );
          return { success: true, product };
        } catch (error) {
          console.error(
            `      ❌ Error creating product ${productData.title}:`,
            error,
          );
          return { success: false, error };
        }
      }),
    );

    createdProductsCount += batchResults.filter(
      (result) => result.success,
    ).length;
  }

  console.log(
    `✅ Created ${createdProductsCount} products out of planned ${totalProducts}!`,
  );
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("🔄 Disconnecting from database...");
    await prisma.$disconnect();
    console.log("👋 Database connection closed.");
  });
