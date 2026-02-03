'use server'

import { saveGame } from "@/lib/game-service";
import { GameConfig } from "@/types/game";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGameAction(game: GameConfig) {
  try {
    await saveGame(game);
  } catch (error) {
    console.error("Failed to create game:", error);
    throw new Error("Failed to create game");
  }
  
  revalidatePath('/');
  redirect('/');
}

export async function updateGameAction(game: GameConfig) {
  try {
    await saveGame(game);
  } catch (error) {
    console.error("Failed to update game:", error);
    throw new Error("Failed to update game");
  }
  
  revalidatePath('/');
  redirect('/');
}
