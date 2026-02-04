"use client";

import { useState } from "react";
import UserMenu from "@/components/ui/UserMenu";
import GameCard from "@/components/ui/GameCard";
import { Gamepad2, LayoutGrid, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { GameConfig } from "@/types/game";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { deleteGameAction } from "@/actions/game-actions";
import { useRouter } from "next/navigation";

interface AdminGamesClientProps {
  initialGames: GameConfig[];
}

export default function AdminGamesClient({ initialGames }: AdminGamesClientProps) {
  const [games, setGames] = useState(initialGames);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);
  const router = useRouter();

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!gameToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGameAction(gameToDelete);
      setGames(games.filter(g => g.id !== gameToDelete));
      setGameToDelete(null);
      setFeedback({
        type: "success",
        title: "Jogo Excluído",
        message: "O jogo foi removido com sucesso da sua organização."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        title: "Erro ao Excluir",
        message: "Não foi possível excluir o jogo. Tente novamente mais tarde."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-500 selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="container flex h-16 items-center px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <Gamepad2 className="text-red-500" />
            <span>ReabHub<span className="text-red-500">Games</span></span>
          </Link>
          
          <nav className="ml-8 hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Início</Link>
            <Link href="/admin/games" className="text-sm font-medium text-white flex items-center gap-2">
              <LayoutGrid size={16} className="text-red-500" />
              Meus Jogos
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link 
              href="/create" 
              className="flex items-center gap-2 text-sm font-medium bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-900/20"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Criar Novo</span>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Jogos</h1>
            <p className="text-zinc-400">Visualize e edite todos os jogos da sua organização.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar jogo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div key={game.id} className="relative group">
                <GameCard game={game} />
                {game.status === 'draft' && (
                  <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
                    Rascunho
                  </div>
                )}
                {game.status === 'published' && (
                  <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm">
                    Publicado
                  </div>
                )}
                
                {/* Delete Button */}
                <button
                  onClick={() => setGameToDelete(game.id)}
                  className="absolute top-2 right-12 z-20 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  title="Excluir Jogo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-500">
                <Gamepad2 size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-zinc-300 font-medium">Nenhum jogo encontrado</p>
                <p className="text-zinc-500 text-sm">Comece criando o seu primeiro jogo terapêutico.</p>
              </div>
              <Link 
                href="/create"
                className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                Criar jogo agora <Plus size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <FeedbackModal
        isOpen={!!gameToDelete}
        onClose={() => setGameToDelete(null)}
        onConfirm={handleDelete}
        type="delete"
        title="Excluir Jogo?"
        message="Esta ação é permanente e removerá todos os níveis e configurações deste jogo."
        confirmLabel="Sim, Excluir"
        cancelLabel="Manter Jogo"
        isLoading={isDeleting}
      />

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={!!feedback}
          onClose={() => setFeedback(null)}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
        />
      )}
    </div>
  );
}
