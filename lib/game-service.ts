import { prisma } from './prisma';
import { GameConfig } from "@/types/game";
import { Prisma } from '@prisma/client';

export async function getAllGames(organizationId?: string, includeDrafts = false): Promise<GameConfig[]> {
  try {
    const where: Prisma.GameWhereInput = {
      OR: [
        { isPublic: true },
        ...(organizationId ? [{ organizationId }] : []),
      ],
    };

    if (!includeDrafts) {
      where.status = 'published';
    }

    const games = await prisma.game.findMany({
      where,
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
        status: (game.status as 'draft' | 'published') || 'draft',
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
      status: (game.status as 'draft' | 'published') || 'draft',
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
  const { id, name, description, type, category, coverImage, status, userId, organizationId, isPublic, levels, ...rest } = game;
  
  if (!userId || !organizationId) {
    throw new Error(`Cannot save game without userId (${userId}) or organizationId (${organizationId})`);
  }

  const config = { levels, ...rest } as unknown as Prisma.InputJsonValue;

  await prisma.game.upsert({
    where: { id },
    update: {
      name,
      description,
      type,
      category,
      coverImage,
      status: status || 'draft',
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
      status: status || 'draft',
      config,
      isPublic: isPublic ?? false,
      userId,
      organizationId,
    },
  });
}

export async function deleteGame(id: string, organizationId: string): Promise<void> {
  await prisma.game.delete({
    where: {
      id,
      organizationId, // Garantir que só deleta se for da mesma organização
    },
  });
}
