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

function extractMediaUrls(obj: any): string[] {
  const urls: Set<string> = new Set();
  
  function recurse(current: any) {
    if (!current) return;
    
    if (typeof current === 'string') {
      if (current.startsWith('https://storage.googleapis.com/')) {
        urls.add(current);
      }
    } else if (Array.isArray(current)) {
      current.forEach(recurse);
    } else if (typeof current === 'object') {
      // Padrões comuns no config do jogo
      if ((current.type === 'image' || current.type === 'audio') && typeof current.value === 'string') {
        if (current.value.startsWith('https://storage.googleapis.com/')) {
          urls.add(current.value);
        }
      }
      Object.values(current).forEach(recurse);
    }
  }
  
  recurse(obj);
  return Array.from(urls);
}

export async function saveGame(game: GameConfig & { userId: string, organizationId: string, isPublic?: boolean }): Promise<void> {
  const { id, name, description, type, category, coverImage, status, userId, organizationId, isPublic, levels, ...rest } = game;
  
  if (!userId || !organizationId) {
    throw new Error(`Cannot save game without userId (${userId}) or organizationId (${organizationId})`);
  }

  const config = { levels, ...rest } as unknown as Prisma.InputJsonValue;

  // Upsert do jogo
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

  // Sincronizar vínculos de mídia
  const allUrls = extractMediaUrls({ config, coverImage });
  
  if (allUrls.length > 0) {
    const mediaItems = await prisma.media.findMany({
      where: {
        url: { in: allUrls },
      },
    });
    
    const mediaIds = mediaItems.map(m => m.id);
    
    await prisma.$transaction([
      prisma.gameMedia.deleteMany({
        where: { gameId: id },
      }),
      prisma.gameMedia.createMany({
        data: mediaIds.map(mediaId => ({
          gameId: id,
          mediaId,
        })),
        skipDuplicates: true,
      }),
    ]);
  } else {
    await prisma.gameMedia.deleteMany({
      where: { gameId: id },
    });
  }
}

export async function deleteGame(id: string, organizationId: string): Promise<void> {
  await prisma.game.delete({
    where: {
      id,
      organizationId, // Garantir que só deleta se for da mesma organização
    },
  });
}
