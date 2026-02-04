'use server'

import { saveGame, deleteGame } from "@/lib/game-service";
import { GameConfig } from "@/types/game";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function createGameAction(game: GameConfig, shouldRedirect = true) {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("Não autorizado: Sessão não encontrada");
  }

  const userId = session.user.id;
  const organizationId = session.user.organizationId;

  if (!userId || !organizationId) {
    console.error("Missing userId or organizationId in session:", { userId, organizationId });
    throw new Error("Dados de usuário ou organização ausentes na sessão");
  }

  try {
    await saveGame({
      ...game,
      userId,
      organizationId,
      isPublic: game.isPublic ?? false
    });
  } catch (error) {
    console.error("CRITICAL ERROR IN createGameAction:", error);
    throw error;
  }
  
  revalidatePath('/');
  revalidatePath('/admin/games');
}

export async function updateGameAction(game: GameConfig) {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;
  const organizationId = session.user.organizationId;

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
  revalidatePath('/admin/games');
}

export async function deleteGameAction(id: string) {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("Não autorizado");
  }

  const organizationId = session.user.organizationId;

  try {
    await deleteGame(id, organizationId);
    revalidatePath('/');
    revalidatePath('/admin/games');
  } catch (error) {
    console.error("Failed to delete game:", error);
    throw new Error("Falha ao excluir o jogo");
  }
}
