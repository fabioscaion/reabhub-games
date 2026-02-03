import GameForm from "@/components/admin/GameForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGamePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="container flex h-16 items-center px-4 md:px-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div className="ml-4 font-bold text-lg">Criar Novo Jogo</div>
        </div>
      </header>

      <main className="w-full h-[calc(100vh-64px)] p-4">
        <GameForm />
      </main>
    </div>
  );
}
