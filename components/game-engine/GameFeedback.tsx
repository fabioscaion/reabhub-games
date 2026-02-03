import React from "react";
import { RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface GameFinishedScreenProps {
  name: string;
  score: number;
  totalLevels: number;
  onRestart: () => void;
}

export const GameFinishedScreen = ({ 
  name, 
  score, 
  totalLevels, 
  onRestart 
}: GameFinishedScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-green-600">Parabéns!</h2>
      <p className="text-xl">Você completou o jogo: {name}</p>
      <div className="text-4xl font-mono font-bold">
        {score} / {totalLevels}
      </div>
      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          <RotateCcw size={20} />
          Jogar Novamente
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Home size={20} />
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
};
