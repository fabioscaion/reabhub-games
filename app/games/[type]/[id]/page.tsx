import { getGameConfig } from "@/lib/game-service";
import GameRunner from "@/components/game-engine/GameRunner";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface GamePageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id, type } = await params;
  const gameConfig = await getGameConfig(id);

  if (!gameConfig) {
    notFound();
  }

  // Optional: Verify if the type matches the URL
  if (gameConfig.type !== type) {
    // In a real app, maybe redirect or 404. For now, we proceed or show warning.
    console.warn(`Game type mismatch: URL says ${type}, config says ${gameConfig.type}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      <header className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para Jogos
          </Link>
        </div>
      </header>

      <main className="py-8">
        <GameRunner config={gameConfig} />
      </main>
    </div>
  );
}
