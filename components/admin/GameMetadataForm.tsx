"use client";

import { GameConfig, GameType } from "@/types/game";
import { Upload, X, ImageIcon, Gamepad2 } from "lucide-react";
import { useState } from "react";
import MediaModal from "./MediaModal";

interface GameMetadataFormProps {
  game: GameConfig;
  setGame: (game: GameConfig) => void;
}

export default function GameMetadataForm({ game, setGame }: GameMetadataFormProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-800/50">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <Gamepad2 size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Configurações</h2>
            <p className="text-xs text-gray-500">Detalhes principais do jogo</p>
          </div>
        </div>
        
        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Jogo</label>
            <input
              type="text"
              required
              value={game.name}
              onChange={(e) => setGame({ ...game, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ex: Animais da Fazenda"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select
              value={game.category}
              onChange={(e) => setGame({ ...game, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Linguagem Expressiva">Linguagem Expressiva</option>
              <option value="Compreensão Visual">Compreensão Visual</option>
              <option value="Processamento Fonológico">Processamento Fonológico</option>
              <option value="Habilidades Cognitivas">Habilidades Cognitivas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Jogo</label>
            <select
              value={game.type}
              onChange={(e) => setGame({ ...game, type: e.target.value as GameType })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="naming">Nomeação (Naming)</option>
              <option value="comprehension">Compreensão (Comprehension)</option>
              <option value="association">Associação (Association)</option>
              <option value="sequencing">Sequenciamento (Sequencing)</option>
              <option value="memory">Memória (Memory)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Imagem de Capa</label>
            <div className="space-y-3">
              {game.coverImage && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGame({ ...game, coverImage: "" })}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ImageIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={game.coverImage}
                    onChange={(e) => setGame({ ...game, coverImage: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="URL da imagem..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors shrink-0"
                >
                  <Upload size={16} />
                  Escolher
                </button>
              </div>
            </div>
          </div>

          <MediaModal
            isOpen={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            onSelect={(url) => {
              setGame({ ...game, coverImage: url });
              setIsMediaModalOpen(false);
            }}
            type="image"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status do Jogo</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={game.status === 'draft'}
                  onChange={() => setGame({ ...game, status: 'draft' })}
                  className="sr-only peer"
                />
                <div className="p-3 text-center rounded-lg border border-gray-300 dark:border-zinc-700 peer-checked:bg-gray-100 dark:peer-checked:bg-zinc-800 peer-checked:border-gray-500 peer-checked:text-gray-700 dark:peer-checked:text-gray-300 transition-all font-medium">
                  Rascunho
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={game.status === 'published'}
                  onChange={() => setGame({ ...game, status: 'published' })}
                  className="sr-only peer"
                />
                <div className="p-3 text-center rounded-lg border border-gray-300 dark:border-zinc-700 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 peer-checked:border-green-500 peer-checked:text-green-600 dark:peer-checked:text-green-400 transition-all font-medium">
                  Publicado
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibilidade</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  checked={game.isPublic === true}
                  onChange={() => setGame({ ...game, isPublic: true })}
                  className="sr-only peer"
                />
                <div className="p-3 text-center rounded-lg border border-gray-300 dark:border-zinc-700 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 transition-all">
                  Público
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  checked={game.isPublic !== true}
                  onChange={() => setGame({ ...game, isPublic: false })}
                  className="sr-only peer"
                />
                <div className="p-3 text-center rounded-lg border border-gray-300 dark:border-zinc-700 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/20 peer-checked:border-orange-500 peer-checked:text-orange-600 dark:peer-checked:text-orange-400 transition-all">
                  Privado
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {game.isPublic ? "Visível para todos os usuários." : "Visível apenas para sua organização."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea
              value={game.description}
              onChange={(e) => setGame({ ...game, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-y"
              placeholder="Descrição breve do jogo..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
