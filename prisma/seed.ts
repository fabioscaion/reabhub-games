import { prisma } from '../lib/prisma'
import fs from 'fs'
import path from 'path'

async function main() {
  // Create a default organization
  const organization = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'Reabhub Games',
    },
  })

  // Create a default admin user
  const user = await prisma.user.upsert({
    where: { email: 'admin@reabhub.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@reabhub.com',
      organizationId: organization.id,
    },
  })

  // Read games from games.json
  const gamesFilePath = path.join(process.cwd(), 'data/games.json')
  const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'))

  console.log(`Seeding ${gamesData.length} games...`)

  for (const game of gamesData) {
    const { levels, ...gameMetadata } = game
    
    await prisma.game.upsert({
      where: { id: game.id },
      update: {
        name: gameMetadata.name,
        description: gameMetadata.description,
        type: gameMetadata.type,
        category: gameMetadata.category,
        coverImage: gameMetadata.coverImage,
        config: { levels },
        isPublic: true, // Existing games are made public by default
        userId: user.id,
        organizationId: organization.id,
      },
      create: {
        id: game.id,
        name: gameMetadata.name,
        description: gameMetadata.description,
        type: gameMetadata.type,
        category: gameMetadata.category,
        coverImage: gameMetadata.coverImage,
        config: { levels },
        isPublic: true,
        userId: user.id,
        organizationId: organization.id,
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
