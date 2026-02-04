import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-zinc-900/50 p-10 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-center">
          <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Acesso Negado
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Você não possui uma sessão ativa ou não tem permissão para acessar esta área.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-zinc-500 mb-8">
            Por favor, retorne à aplicação principal e certifique-se de estar logado corretamente.
          </p>
          
          <Link 
            href={process.env.NEXT_PUBLIC_MAIN_APP_URL || "#"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <ArrowLeft size={18} />
            Voltar para ReabHub
          </Link>
        </div>

        <div className="pt-6 border-t border-zinc-800/50">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            ReabHub Games • Security Proxy
          </p>
        </div>
      </div>
    </div>
  );
}
