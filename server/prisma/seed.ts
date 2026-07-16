import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const leads = [
  {
    businessName: "Trattoria Bellavista",
    industry: "restaurant",
    contactName: "Marco Rinaldi",
    email: "marco@bellavista-example.com",
    phone: "+1-555-0101",
    addressLine1: "42 Harbor St",
    city: "Bremen",
    region: "HB",
    postalCode: "28195",
  },
  {
    businessName: "Corner Books & Coffee",
    industry: "retail",
    contactName: "Ada Lindqvist",
    email: "ada@cornerbooks-example.com",
    phone: "+1-555-0102",
    addressLine1: "9 Market Ln",
    city: "Bremen",
    region: "HB",
    postalCode: "28203",
  },
  {
    businessName: "Sunset Nails Studio",
    industry: "beauty",
    contactName: "Priya Nair",
    email: "priya@sunsetnails-example.com",
    addressLine1: "118 Bloom Ave",
    city: "Bremen",
    region: "HB",
    postalCode: "28217",
  },
  {
    businessName: "Kestrel Bike Repair",
    industry: "auto/bike service",
    contactName: "Tom Keller",
    phone: "+1-555-0104",
    addressLine1: "7 Foundry Rd",
    city: "Bremen",
    region: "HB",
    postalCode: "28237",
  },
  {
    businessName: "Nomad Ramen House",
    industry: "restaurant",
    contactName: "Yuki Tanaka",
    email: "yuki@nomadramen-example.com",
    phone: "+1-555-0105",
    addressLine1: "203 Noodle Way",
    city: "Bremen",
    region: "HB",
    postalCode: "28199",
  },
  {
    businessName: "Greenline Landscaping",
    industry: "home services",
    contactName: "Sofia Reyes",
    email: "sofia@greenline-example.com",
    addressLine1: "56 Fielder Ct",
    city: "Bremen",
    region: "HB",
    postalCode: "28259",
  },
  {
    businessName: "The Kneaded Loaf Bakery",
    industry: "restaurant",
    contactName: "Hana Schulz",
    email: "hana@kneadedloaf-example.com",
    phone: "+1-555-0107",
    addressLine1: "18 Miller St",
    city: "Bremen",
    region: "HB",
    postalCode: "28211",
  },
  {
    businessName: "Ironclad Fitness",
    industry: "fitness",
    contactName: "Derek Osei",
    addressLine1: "301 Anchor Blvd",
    city: "Bremen",
    region: "HB",
    postalCode: "28241",
  },
  {
    businessName: "Petal & Stem Florist",
    industry: "retail",
    contactName: "Ines Costa",
    email: "ines@petalstem-example.com",
    phone: "+1-555-0109",
    addressLine1: "64 Garden Row",
    city: "Bremen",
    region: "HB",
    postalCode: "28219",
  },
  {
    businessName: "Rustic Table Diner",
    industry: "restaurant",
    contactName: "Bill Novak",
    email: "bill@rustictable-example.com",
    addressLine1: "12 Old Mill Rd",
    city: "Bremen",
    region: "HB",
    postalCode: "28205",
  },
];

async function main() {
  await prisma.jobLog.deleteMany();
  await prisma.marketingPost.deleteMany();
  await prisma.site.deleteMany();
  await prisma.onboardingIntake.deleteMany();
  await prisma.outreachMessage.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.lead.deleteMany();

  for (const lead of leads) {
    await prisma.lead.create({
      data: { ...lead, source: "SEED" },
    });
  }

  console.log(`${leads.length} leads inserted.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
