import { getGameConfig } from "@/lib/game-service";
import GameForm from "@/components/admin/GameForm";
import { notFound } from "next/navigation";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGameConfig(id);

  if (!game) {
    notFound();
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Editar Jogo</h1>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <GameForm initialData={game} />
      </div>
    </div>
  );
}
