import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed categories (from the mockup dropdown)
  const categoryNames = [
    'City',
    'Community events',
    'Crime & Safety',
    'Culture',
    'Discounts & Benefits',
    'Emergencies',
    'For Seniors',
    'Health',
    'Kids & Family',
  ];

  const categories: Record<string, { id: number }> = {};

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category;
  }

  console.log(`Seeded ${categoryNames.length} categories`);

  // Seed announcements (matching the mockup data)
  const announcements = [
    {
      title: 'Title 1',
      content: 'This is the content of the first announcement about city news and updates.',
      publicationDate: new Date('2023-08-11T04:38:00'),
      categoryNames: ['City'],
    },
    {
      title: 'Title 2',
      content: 'Second announcement with important city information for all residents.',
      publicationDate: new Date('2023-08-11T04:36:00'),
      categoryNames: ['City'],
    },
    {
      title: 'Title 3',
      content: 'Third announcement covering local city developments and plans.',
      publicationDate: new Date('2023-08-11T04:35:00'),
      categoryNames: ['City'],
    },
    {
      title: 'Title 4',
      content: 'City infrastructure update and maintenance schedule announcement.',
      publicationDate: new Date('2023-04-19T05:14:00'),
      categoryNames: ['City'],
    },
    {
      title: 'Title 5',
      content: 'Important notice about upcoming city events and road closures.',
      publicationDate: new Date('2023-04-19T05:11:00'),
      categoryNames: ['City'],
    },
    {
      title: 'Title 6',
      content: 'Community update about parks and recreation facilities in the city.',
      publicationDate: new Date('2023-04-19T05:11:00'),
      categoryNames: ['City'],
    },
    {
      title: 'Title 7',
      content: 'Joint city and health department announcement about wellness programs.',
      publicationDate: new Date('2023-03-24T07:27:00'),
      categoryNames: ['City', 'Health'],
    },
    {
      title: 'Title 8',
      content: 'Health and safety guidelines update for city residents.',
      publicationDate: new Date('2023-03-24T07:26:00'),
      categoryNames: ['City', 'Health'],
    },
    {
      title: 'Title 9',
      content: 'Public health advisory and city response coordination notice.',
      publicationDate: new Date('2023-03-24T07:26:00'),
      categoryNames: ['City', 'Health'],
    },
    {
      title: 'Title 10',
      content: 'Community health fair and city services information announcement.',
      publicationDate: new Date('2023-03-24T07:26:00'),
      categoryNames: ['City', 'Health'],
    },
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({
      data: {
        title: ann.title,
        content: ann.content,
        publicationDate: ann.publicationDate,
        categories: {
          create: ann.categoryNames.map((name) => ({
            categoryId: categories[name].id,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${announcements.length} announcements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
