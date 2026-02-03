'use server'

import { saveGame } from "@/lib/game-service";
import { GameConfig } from "@/types/game";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function createGameAction(game: GameConfig) {
  const session = await auth();
  
  if (!session) {
    throw new Error("Não autorizado");
  }

  const userId = (session.user as any).id;
  const organizationId = (session.user as any).organizationId;

  try {
    await saveGame({
      ...game,
      userId,
      organizationId,
      isPublic: game.isPublic ?? false
    });
  } catch (error) {
    console.error("Failed to create game:", error);
    throw new Error("Failed to create game");
  }
  
  revalidatePath('/');
  redirect('/');
}

export async function updateGameAction(game: GameConfig) {
  const session = await auth();
  
  if (!session) {
    throw new Error("Não autorizado");
  }

  const userId = (session.user as any).id;
  const organizationId = (session.user as any).organizationId;

  try {
    await saveGame({
      ...game,
      userId,
      organizationId,
      isPublic: game.isPublic ?? false
    });
  } catch (error) {
    console.error("Failed to update game:", error);
    throw new Error("Failed to update game");
  }
  
  revalidatePath('/');
  redirect('/');
}
