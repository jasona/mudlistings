import { PrismaClient, Genre, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...\n");

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mudlistings.com" },
    update: {},
    create: {
      email: "admin@mudlistings.com",
      displayName: "Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.SITE_ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create some sample MUDs
  const sampleMuds = [
    {
      name: "Aardwolf",
      slug: "aardwolf",
      shortDescription: "One of the most popular free MUDs in existence",
      description:
        "Aardwolf is a free, no-strings-attached Multi-User Dungeon (MUD) - a text-based online game. It features over 400 unique areas, detailed character customization, extensive equipment, and a helpful community.",
      connectionHost: "aardwolf.org",
      connectionPort: 4000,
      website: "https://www.aardwolf.com",
      genres: [Genre.FANTASY, Genre.PVP],
      isOnline: true,
    },
    {
      name: "Discworld MUD",
      slug: "discworld-mud",
      shortDescription: "Based on Terry Pratchett's Discworld novels",
      description:
        "Discworld MUD is a free, text-based online game set in Terry Pratchett's Discworld. Explore the streets of Ankh-Morpork, join a guild, and experience one of the most detailed MUD worlds ever created.",
      connectionHost: "discworld.starturtle.net",
      connectionPort: 4242,
      website: "https://discworld.starturtle.net",
      genres: [Genre.FANTASY, Genre.ROLEPLAY],
      isOnline: true,
    },
    {
      name: "Alter Aeon",
      slug: "alter-aeon",
      shortDescription: "A unique multiclass MUD with accessibility features",
      description:
        "Alter Aeon is a free, multiclass MUD with extensive accessibility features for blind and visually impaired players. Features include unique multiclassing, crafting, and a vibrant community.",
      connectionHost: "alteraeon.com",
      connectionPort: 3000,
      website: "https://www.alteraeon.com",
      genres: [Genre.FANTASY, Genre.SOCIAL],
      isOnline: true,
    },
    {
      name: "Genesis LPMud",
      slug: "genesis-lpmud",
      shortDescription: "One of the oldest still-running MUDs",
      description:
        "Genesis is one of the oldest continuously running MUDs in the world, established in 1989. It features a large world with diverse domains and a deep focus on roleplay.",
      connectionHost: "mud.genesismud.org",
      connectionPort: 3011,
      website: "https://www.genesismud.org",
      genres: [Genre.FANTASY, Genre.ROLEPLAY, Genre.HISTORICAL],
      isOnline: true,
    },
    {
      name: "BatMUD",
      slug: "batmud",
      shortDescription: "A highly developed fantasy MUD with three continents",
      description:
        "BatMUD is a massive fantasy MUD with three continents, extensive character customization, and guilds. Active since 1990, it features regular events and an engaged player community.",
      connectionHost: "batmud.bat.org",
      connectionPort: 23,
      website: "https://www.bat.org",
      genres: [Genre.FANTASY, Genre.PVP],
      isOnline: true,
    },
  ];

  for (const mudData of sampleMuds) {
    const { genres, ...data } = mudData;
    const mud = await prisma.mud.upsert({
      where: { slug: mudData.slug },
      update: {},
      create: {
        ...data,
        genres: {
          create: genres.map((genre) => ({ genre })),
        },
        trendingScore: Math.random() * 100,
      },
    });
    console.log(`Created MUD: ${mud.name}`);
  }

  // Create sample user
  const userPasswordHash = await bcrypt.hash("player123", 10);
  const player = await prisma.user.upsert({
    where: { email: "player@example.com" },
    update: {},
    create: {
      email: "player@example.com",
      displayName: "SamplePlayer",
      passwordHash: userPasswordHash,
      role: UserRole.PLAYER,
      emailVerified: new Date(),
    },
  });
  console.log(`Created player user: ${player.email}`);

  // Create sample reviews
  const muds = await prisma.mud.findMany({ take: 3 });
  for (const mud of muds) {
    const review = await prisma.review.upsert({
      where: {
        mudId_userId: {
          mudId: mud.id,
          userId: player.id,
        },
      },
      update: {},
      create: {
        mudId: mud.id,
        userId: player.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
        title: "Great experience!",
        body: `I've been playing ${mud.name} for a while now and really enjoy it. The community is welcoming and there's always something to do.`,
      },
    });
    console.log(`Created review for ${mud.name}`);

    // Update MUD rating
    await prisma.mud.update({
      where: { id: mud.id },
      data: {
        ratingAverage: review.rating,
        ratingCount: 1,
      },
    });
  }

  // Feature some MUDs
  const mudsToFeature = await prisma.mud.findMany({ take: 3 });
  for (let i = 0; i < mudsToFeature.length; i++) {
    await prisma.mud.update({
      where: { id: mudsToFeature[i].id },
      data: {
        isFeatured: true,
        featuredOrder: i + 1,
        featuredAt: new Date(),
      },
    });
    console.log(`Featured: ${mudsToFeature[i].name}`);
  }

  console.log("\n--- Seed Summary ---");
  console.log(`Users: ${await prisma.user.count()}`);
  console.log(`MUDs: ${await prisma.mud.count()}`);
  console.log(`Reviews: ${await prisma.review.count()}`);
  console.log(
    `Featured MUDs: ${await prisma.mud.count({ where: { isFeatured: true } })}`
  );
}

main()
  .then(() => {
    console.log("\nSeed completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
