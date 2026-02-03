import { getGameConfig } from "@/lib/game-service";
import GameForm from "@/components/admin/GameForm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acesso Restrito</h1>
          <p className="text-zinc-400">Você precisa estar logado no ReabHub para editar jogos.</p>
        </div>
      </div>
    );
  }

  const organizationId = (session?.user as any)?.organizationId;
  const game = await getGameConfig(id, organizationId);

  if (!game) {
    notFound();
  }

  // Verificar se o usuário pertence à mesma organização para editar
  if (game.organizationId !== organizationId) {
    redirect("/");
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
