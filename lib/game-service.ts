import { prisma } from './prisma';
import { GameConfig } from "@/types/game";
import { Prisma } from '@prisma/client';

export async function getAllGames(organizationId?: string): Promise<GameConfig[]> {
  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { isPublic: true },
          ...(organizationId ? [{ organizationId }] : []),
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return games.map(game => {
      const config = game.config as any;
      return {
        ...config,
        id: game.id,
        name: game.name,
        description: game.description || undefined,
        type: game.type as any,
        category: game.category,
        coverImage: game.coverImage || undefined,
        isPublic: game.isPublic,
        userId: game.userId,
        organizationId: game.organizationId,
      };
    });
  } catch (error) {
    console.error("Error reading games from database:", error);
    return [];
  }
}

export async function getGameConfig(id: string, organizationId?: string): Promise<GameConfig | null> {
  try {
    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) return null;

    // Verificar visibilidade: público ou pertence à mesma organização
    if (!game.isPublic && game.organizationId !== organizationId) {
      return null;
    }

    const config = game.config as any;
    return {
      ...config,
      id: game.id,
      name: game.name,
      description: game.description || undefined,
      type: game.type as any,
      category: game.category,
      coverImage: game.coverImage || undefined,
      isPublic: game.isPublic,
      userId: game.userId,
      organizationId: game.organizationId,
    };
  } catch (error) {
    console.error("Error reading game from database:", error);
    return null;
  }
}

export async function saveGame(game: GameConfig & { userId: string, organizationId: string, isPublic?: boolean }): Promise<void> {
  const { id, name, description, type, category, coverImage, userId, organizationId, isPublic, levels, ...rest } = game;
  
  const config = { levels, ...rest } as unknown as Prisma.InputJsonValue;

  await prisma.game.upsert({
    where: { id },
    update: {
      name,
      description,
      type,
      category,
      coverImage,
      config,
      isPublic: isPublic ?? false,
      userId,
      organizationId,
    },
    create: {
      id,
      name,
      description,
      type,
      category,
      coverImage,
      config,
      isPublic: isPublic ?? false,
      userId,
      organizationId,
    },
  });
}
