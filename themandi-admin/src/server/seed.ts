import { PrismaClient, Role } from "@prisma/client";
import { faker, en_IN, Faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configure faker to use Indian locale
const fakerIN = new Faker({ locale: [en_IN] });

// Define specific image URLs for each product category
const productImages = {
  Vegetables: {
    "Bhindi (Okra)":
      "https://images.unsplash.com/photo-1603566541830-a1e7e71a2743",
    "Baingan (Eggplant)":
      "https://images.unsplash.com/photo-1597156298117-251f63e2a04a",
    "Aloo (Potato)":
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
    "Pyaaz (Onion)":
      "https://images.unsplash.com/photo-1620574387735-3921be347658",
    "Tamatar (Tomato)":
      "https://images.unsplash.com/photo-1582284540020-8acbe03f4924",
    "Gobhi (Cauliflower)":
      "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3",
    "Matar (Peas)":
      "https://images.unsplash.com/photo-1587735243615-c03f25aaff15",
    "Gajar (Carrot)":
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
    "Palak (Spinach)":
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
    "Kaddu (Pumpkin)":
      "https://images.unsplash.com/photo-1506917728037-b6af01a7d403",
    "Turai (Ridge Gourd)":
      "https://images.unsplash.com/photo-1622205313162-be1d5712a43b",
    "Lauki (Bottle Gourd)":
      "https://images.unsplash.com/photo-1596241913242-b28213e88909",
    "Shimla Mirch (Capsicum)":
      "https://images.unsplash.com/photo-1586861256632-5b9a9776438e",
    "Karela (Bitter Gourd)":
      "https://images.unsplash.com/photo-1631203928493-a2d36c1ddc38",
    "Mooli (Radish)":
      "https://images.unsplash.com/photo-1650130597614-32807899edfe",
  },
  Fruits: {
    "Aam (Mango)":
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716",
    "Kela (Banana)":
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
    "Seb (Apple)":
      "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2",
    "Anaar (Pomegranate)":
      "https://images.unsplash.com/photo-1603664454146-50b9bb1e7afa",
    "Papita (Papaya)":
      "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe",
    Jamun: "https://images.unsplash.com/photo-1628781321874-2c563ebaf2a4",
    "Amrood (Guava)":
      "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46",
    "Narangi (Orange)":
      "https://images.unsplash.com/photo-1547514701-42782101795e",
    "Chikoo (Sapodilla)":
      "https://images.unsplash.com/photo-1620012074797-ab6a0344476f",
    Lychee: "https://images.unsplash.com/photo-1626143508000-4b252afa0e18",
    "Nashpati (Pear)":
      "https://images.unsplash.com/photo-1615484477778-ca3b77940c25",
    "Tarbooz (Watermelon)":
      "https://images.unsplash.com/photo-1587049332298-1c42e83937a7",
    "Kharbuja (Muskmelon)":
      "https://images.unsplash.com/photo-1571575173700-afb9492e6a50",
    "Sitafal (Custard Apple)":
      "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe",
    "Angoor (Grapes)":
      "https://images.unsplash.com/photo-1596363505729-4190a9506133",
  },
  Grains: {
    "Chawal (Rice)":
      "https://images.unsplash.com/photo-1586201375761-83865001e8ac",
    "Gehun (Wheat)":
      "https://images.unsplash.com/photo-1574323347407-f5e1c5a1ec21",
    "Bajra (Pearl Millet)":
      "https://images.unsplash.com/photo-1622866306635-7f4eef78dffc",
    "Jowar (Sorghum)":
      "https://images.unsplash.com/photo-1584473457493-27a6f9db996e",
    "Makka (Corn)": "https://images.unsplash.com/photo-1551754655-cd27e38d2076",
    "Ragi (Finger Millet)":
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5",
    "Chana (Chickpeas)":
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
    "Moong Dal (Green Gram)":
      "https://images.unsplash.com/photo-1580317092099-ade9937dee4f",
    "Masoor Dal (Red Lentils)":
      "https://images.unsplash.com/photo-1597592443777-e0ee4097f4a0",
    "Toor Dal (Pigeon Peas)":
      "https://images.unsplash.com/photo-1612257999756-61d09b96ec08",
    "Urad Dal (Black Gram)":
      "https://images.unsplash.com/photo-1648968599528-0c56ce5e3549",
    "Rajma (Kidney Beans)":
      "https://images.unsplash.com/photo-1590872345695-0bceef898d4f",
    "Jau (Barley)":
      "https://images.unsplash.com/photo-1589927986089-35812388d1f4",
    "Soya Bean": "https://images.unsplash.com/photo-1612491988854-638b927f2cbb",
    "Kulthi (Horse Gram)":
      "https://images.unsplash.com/photo-1580389642473-acf29cb44e56",
  },
  Spices: {
    "Haldi (Turmeric)":
      "https://images.unsplash.com/photo-1615485290398-ee9c1099c8c0",
    "Mirch (Chili)":
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d",
    "Jeera (Cumin)":
      "https://images.unsplash.com/photo-1590301157890-4810ed352733",
    "Dhania (Coriander)":
      "https://images.unsplash.com/photo-1599909855085-21970dd1d0c7",
    "Ilaychi (Cardamom)":
      "https://images.unsplash.com/photo-1638235887202-2470fcff53f1",
    "Lavang (Clove)":
      "https://images.unsplash.com/photo-1611119220545-a060a699ce30",
    "Dalchini (Cinnamon)":
      "https://images.unsplash.com/photo-1607198179219-10d3d1c09bca",
    "Kali Mirch (Black Pepper)":
      "https://images.unsplash.com/photo-1599910092660-44b9abad70c8",
    "Ajwain (Carom Seeds)":
      "https://images.unsplash.com/photo-1602406668377-1e5c4555a775",
    "Saunf (Fennel)":
      "https://images.unsplash.com/photo-1599086291261-9232b7cf4fff",
    "Methi (Fenugreek)":
      "https://images.unsplash.com/photo-1637966483713-2ef5a3a61d87",
    "Hing (Asafoetida)":
      "https://images.unsplash.com/photo-1638694427495-636bf232623a",
    "Kesar (Saffron)":
      "https://images.unsplash.com/photo-1591189824176-2a27889ba1c6",
    "Jaiphal (Nutmeg)":
      "https://images.unsplash.com/photo-1629325421417-09c0b0c7ba81",
    "Tej Patta (Bay Leaf)":
      "https://images.unsplash.com/photo-1596889157941-d2651f0a90ff",
  },
  Dairy: {
    "Desi Ghee": "https://images.unsplash.com/photo-1631778068246-da3e4f7a4e29",
    "Dahi (Yogurt)":
      "https://images.unsplash.com/photo-1571212515416-fef01fc43637",
    Paneer: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166",
    "Makhan (Butter)":
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d",
    "Chaas (Buttermilk)":
      "https://images.unsplash.com/photo-1608639515581-e71b11049876",
    Lassi: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f",
    Khoya: "https://images.unsplash.com/photo-1552375302-8a8e3702e5c5",
    Shrikhand: "https://images.unsplash.com/photo-1591462391944-3e72e528ce7d",
    Mawa: "https://images.unsplash.com/photo-1605300045759-0664df7a9ec1",
    Cheese: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b",
    "Malai (Cream)":
      "https://images.unsplash.com/photo-1608472870995-0221dbf15275",
    Chhachh: "https://images.unsplash.com/photo-1563355592-7e4f02d75226",
    "Mishti Doi":
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e",
    Kheer: "https://images.unsplash.com/photo-1642320009030-ff80041e25ed",
    Basundi: "https://images.unsplash.com/photo-1625301840055-7b17c524defe",
  },
  Organic: {
    "Organic Brown Rice":
      "https://images.unsplash.com/photo-1586201375761-83865001e8ac",
    "Organic Jaggery":
      "https://images.unsplash.com/photo-1608979040467-6195d5d10790",
    "Organic Honey":
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924",
    "Organic Coconut Oil":
      "https://images.unsplash.com/photo-1598380202449-b606a95ad78b",
    "Organic Ghee":
      "https://images.unsplash.com/photo-1631778068246-da3e4f7a4e29",
    "Organic Palm Sugar":
      "https://images.unsplash.com/photo-1604079628298-84182257f95b",
    "Organic Millets":
      "https://images.unsplash.com/photo-1623227166281-e5a74d1860cf",
    "Organic Flours":
      "https://images.unsplash.com/photo-1603356033288-acfcb54801e6",
    "Organic Tea": "https://images.unsplash.com/photo-1546445317-29f4545e9d53",
    "Organic Coffee":
      "https://images.unsplash.com/photo-1621155586353-5d20417dc829",
    "Organic Spice Mixes":
      "https://images.unsplash.com/photo-1596397249129-c7726d5dc7f1",
    "Organic Dry Fruits":
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
    "Organic Seeds":
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5",
    "Organic Nuts":
      "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e",
    "Organic Pulses":
      "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f",
  },
};

// Create a fallback image function in case a specific product image is missing
const getFallbackImage = (category: string) => {
  const fallbackImages = {
    Vegetables: "https://images.unsplash.com/photo-1557844352-761f2023520d",
    Fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
    Grains: "https://images.unsplash.com/photo-1574323347126-631450e72736",
    Spices: "https://images.unsplash.com/photo-1532336414038-cf19250c5757",
    Dairy: "https://images.unsplash.com/photo-1628689469738-3535f5951a14",
    Organic: "https://images.unsplash.com/photo-1542838132-92c53300491e",
  };

  return (
    fallbackImages[category as keyof typeof fallbackImages] ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e"
  ); // Default organic image as final fallback
};

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

    console.log("  - Deleting carts...");
    await prisma.cart.deleteMany();

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

      // Get relevant image URL for the product
      const categoryImages =
        productImages[category.name as keyof typeof productImages] || {};
      const imageUrl =
        categoryImages[productName as keyof typeof categoryImages] ||
        getFallbackImage(category.name);

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
        imageUrl: imageUrl,
      };

      // Store metadata separately for logging
      productMetadata.set(productData, {
        productCount,
        farmerName: farmer.name,
        tagNames: productTags.map((t) => t.name).join(", "),
        imageUrl: imageUrl,
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
          console.log(`      - Image URL: ${meta.imageUrl}`);

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
