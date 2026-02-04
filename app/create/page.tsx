import GameForm from "@/components/admin/GameForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateGamePage() {
  const session = await auth();
  
  if (!session) {
    // Em vez de redirecionar para uma página local, podemos apenas não renderizar ou mostrar uma mensagem
    // Já que o login é externo. Idealmente, o middleware ou o app principal cuidaria disso.
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acesso Restrito</h1>
          <p className="text-zinc-400">Você precisa estar logado no ReabHub para criar jogos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="container flex h-16 items-center px-4 md:px-8">
          <Link 
            href="/games" 
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
