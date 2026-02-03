import { promises as fs } from 'fs';
import path from 'path';
import { GameConfig } from "@/types/game";
import { MOCK_GAMES } from './initial-data';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'games.json');

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    // Initialize with mock data as an array
    const initialData = Object.values(MOCK_GAMES);
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

export async function getAllGames(): Promise<GameConfig[]> {
  await ensureDb();
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading games database:", error);
    return Object.values(MOCK_GAMES);
  }
}

export async function getGameConfig(id: string): Promise<GameConfig | null> {
  const games = await getAllGames();
  return games.find(g => g.id === id) || null;
}

export async function saveGame(game: GameConfig): Promise<void> {
  await ensureDb();
  const games = await getAllGames();
  
  // Check if game exists to update it, otherwise add new
  const index = games.findIndex(g => g.id === game.id);
  if (index >= 0) {
    games[index] = game;
  } else {
    games.push(game);
  }
  
  await fs.writeFile(DB_PATH, JSON.stringify(games, null, 2));
}
