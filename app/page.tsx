import { getAllGames } from "@/lib/game-service";
import HomeClient from "@/components/ui/HomeClient";
import { Gamepad2, Plus, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import UserMenu from "@/components/ui/UserMenu";

export default async function Home() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  const games = await getAllGames(organizationId, false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-500 selection:text-white">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="container flex h-16 items-center px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Gamepad2 className="text-red-500" />
            <span>ReabHub<span className="text-red-500">Games</span></span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link 
              href="/admin/games" 
              className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mr-2"
            >
              <LayoutGrid size={16} />
              <span>Meus Jogos</span>
            </Link>
            <Link 
              href="/create" 
              className="hidden md:flex items-center gap-2 text-sm font-medium bg-zinc-800 text-zinc-100 px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              <Plus size={16} />
              <span>Criar Jogo</span>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Jogos Disponíveis</h1>
          <p className="text-zinc-400">Selecione uma categoria para começar o tratamento.</p>
        </div>

        <HomeClient initialGames={games} />
      </main>
    </div>
  );
}
