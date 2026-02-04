import React from 'react';
import { 
  Zap, 
  MousePointerClick, 
  MousePointer2,
  LogOut, 
  Music, 
  ArrowRight, 
  Settings, 
  Move, 
  Database, 
  Sparkles, 
  GitFork, 
  Clock, 
  Share2,
  Target,
  CheckCircle,
  XCircle 
} from 'lucide-react';

interface LogicSidebarProps {
  elements: any[];
  addEventNode: (type: string, label: string, elementId?: string) => void;
  addActionNode: (type: string, label: string) => void;
  addLogicNode: (type: string, label: string) => void;
  addAnimationNode: () => void;
  addBroadcastNode: () => void;
  addVariableNode: () => void;
}

const LogicSidebar = ({
  elements,
  addEventNode,
  addActionNode,
  addLogicNode,
  addAnimationNode,
  addBroadcastNode,
  addVariableNode,
}: LogicSidebarProps) => {
  return (
    <div className="w-72 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 p-4 overflow-y-auto shrink-0">
      <div className="space-y-8">
        {/* Eventos */}
        <div>
          <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest border-b border-gray-100 dark:border-zinc-800 pb-1">Eventos</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addEventNode('onStart', 'Ao Iniciar Nível')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all group"
            >
              <Zap size={18} className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Iniciar Nível</span>
            </button>
            <button 
              onClick={() => addEventNode('onClick', 'Ao Clicar')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all group"
            >
              <MousePointerClick size={18} className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Ao Clicar</span>
            </button>
            <button 
              onClick={() => addEventNode('onHover', 'Ao Passar o Mouse')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all group"
            >
              <MousePointer2 size={18} className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Ao Passar Mouse</span>
            </button>
            <button 
              onClick={() => addEventNode('onBlur', 'Ao Sair (Input)')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all group"
            >
              <LogOut size={18} className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Ao Sair</span>
            </button>
            <button 
              onClick={() => addEventNode('onOverlap', 'Ao Encostar')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all group"
            >
              <Target size={18} className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Ao Encostar</span>
            </button>
            <button 
              onClick={() => addEventNode('onSeparate', 'Ao Desencostar')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all group"
            >
              <Target size={18} className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform opacity-50" />
              <span className="text-center leading-tight">Ao Desencostar</span>
            </button>
          </div>
        </div>

        {/* Ações */}
        <div>
          <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest border-b border-gray-100 dark:border-zinc-800 pb-1">Ações</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addActionNode('playSound', 'Tocar Som')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group"
            >
              <Music size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Tocar Som</span>
            </button>
            <button 
              onClick={() => addActionNode('goToLevel', 'Ir para Nível')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group"
            >
              <ArrowRight size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Ir p/ Nível</span>
            </button>
            <button 
              onClick={() => addActionNode('goToSuccess', 'Ir para Sucesso')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 transition-all group"
            >
              <CheckCircle size={18} className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Sucesso</span>
            </button>
            <button 
              onClick={() => addActionNode('goToError', 'Ir para Erro')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group"
            >
              <XCircle size={18} className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Erro</span>
            </button>
            <button 
              onClick={() => addActionNode('setProperty', 'Alterar Propriedade')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group"
            >
              <Settings size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight px-1">Alterar Prop.</span>
            </button>
            <button 
              onClick={() => addActionNode('move', 'Mover Elemento')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group"
            >
              <Move size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Mover Item</span>
            </button>
            <button 
              onClick={() => addActionNode('saveToVariable', 'Salvar em Variável')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group"
            >
              <Database size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Salvar Var.</span>
            </button>
            <button 
              onClick={() => addAnimationNode()}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-900/30 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/20 transition-all group"
            >
              <Sparkles size={18} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Animação</span>
            </button>
          </div>
        </div>

        {/* Lógica */}
        <div>
          <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest border-b border-gray-100 dark:border-zinc-800 pb-1">Lógica</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addLogicNode('ifElse', 'Se / Então')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
            >
              <GitFork size={18} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Se / Então</span>
            </button>
            <button 
              onClick={() => addLogicNode('wait', 'Esperar (Delay)')}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
            >
              <Clock size={18} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Esperar</span>
            </button>
            <button 
              onClick={() => addBroadcastNode()}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all group"
            >
              <Share2 size={18} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Múltiplas Saídas</span>
            </button>
            <button 
              onClick={() => addVariableNode()}
              className="flex flex-col items-center justify-center p-3 gap-2 text-[10px] font-medium bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
            >
              <Database size={18} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-center leading-tight">Definir Variável</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicSidebar;
