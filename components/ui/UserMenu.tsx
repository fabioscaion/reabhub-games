"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User, LogIn } from "lucide-react";
import Link from "next/link";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 italic">
        <span>Sessão Externa</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-zinc-100">{session.user?.name}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
          {(session.user as any).organizationId ? "Organização Ativa" : "Sem Organização"}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-900/50 rounded-lg border border-zinc-800"
        title="Sair"
      >
        <LogOut size={16} />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-900/20 border border-white/10">
        <User size={18} className="text-white" />
      </div>
    </div>
  );
}
