import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Play, 
  Zap, 
  Code, 
  Sparkles, 
  Plus, 
  Trash2, 
  Share2, 
  Music, 
  ArrowRight, 
  Settings, 
  Move, 
  Database, 
  GitFork, 
  Clock, 
  MousePointerClick, 
  MousePointer2,
  LogOut,
  Target,
  CheckCircle,
  XCircle 
} from 'lucide-react';

const getNodeIcon = (type: string, subType?: string) => {
  switch (subType) {
    case 'onStart': return <Zap className="w-4 h-4 text-yellow-500 mr-2" />;
    case 'onClick': return <MousePointerClick className="w-4 h-4 text-yellow-500 mr-2" />;
    case 'onHover': return <MousePointer2 className="w-4 h-4 text-yellow-500 mr-2" />;
    case 'onBlur': return <LogOut className="w-4 h-4 text-yellow-500 mr-2" />;
    case 'onOverlap': return <Target className="w-4 h-4 text-yellow-500 mr-2" />;
    case 'onSeparate': return <Target className="w-4 h-4 text-yellow-500 mr-2 opacity-50" />;
    case 'playSound': return <Music className="w-4 h-4 text-blue-500 mr-2" />;
    case 'goToLevel': return <ArrowRight className="w-4 h-4 text-blue-500 mr-2" />;
    case 'goToSuccess': return <CheckCircle className="w-4 h-4 text-green-500 mr-2" />;
    case 'goToError': return <XCircle className="w-4 h-4 text-red-500 mr-2" />;
    case 'completeLevel': return <Play className="w-4 h-4 text-blue-500 mr-2" />;
    case 'setProperty': return <Settings className="w-4 h-4 text-blue-500 mr-2" />;
    case 'move': return <Move className="w-4 h-4 text-blue-500 mr-2" />;
    case 'saveToVariable': return <Database className="w-4 h-4 text-blue-500 mr-2" />;
    case 'animate': return <Sparkles className="w-4 h-4 text-cyan-500 mr-2" />;
    case 'if':
    case 'ifElse': return <GitFork className="w-4 h-4 text-purple-500 mr-2" />;
    case 'wait': return <Clock className="w-4 h-4 text-purple-500 mr-2" />;
    case 'random': return <Code className="w-4 h-4 text-purple-500 mr-2" />;
    case 'broadcast': return <Share2 className="w-4 h-4 text-emerald-500 mr-2" />;
    case 'setVariable': return <Database className="w-4 h-4 text-purple-500 mr-2" />;
    default:
      if (type === 'trigger') return <Zap className="w-4 h-4 text-yellow-500 mr-2" />;
      if (type === 'action') return <Play className="w-4 h-4 text-blue-500 mr-2" />;
      if (type === 'animation') return <Sparkles className="w-4 h-4 text-cyan-500 mr-2" />;
      if (type === 'logic') return <Code className="w-4 h-4 text-purple-500 mr-2" />;
      return <Code className="w-4 h-4 text-gray-500 mr-2" />;
  }
};

export const BroadcastNode = ({ data }: any) => {
  const outputs = data.outputs || ['Saída 1'];

  const addOutput = () => {
    const newOutputs = [...outputs, `Saída ${outputs.length + 1}`];
    data.onDataChange?.({ outputs: newOutputs });
  };

  const removeOutput = (index: number) => {
    if (outputs.length <= 1) return;
    const newOutputs = outputs.filter((_: any, i: number) => i !== index);
    data.onDataChange?.({ outputs: newOutputs });
  };

  const updateOutputName = (index: number, name: string) => {
    const newOutputs = [...outputs];
    newOutputs[index] = name;
    data.onDataChange?.({ outputs: newOutputs });
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 border-emerald-500 min-w-[200px]">
      <div className="flex items-center border-b border-gray-100 dark:border-zinc-700 pb-1 mb-2">
        {getNodeIcon('logic', 'broadcast')}
        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{data.label || 'Múltiplas Saídas'}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Caminhos</label>
          <button 
            type="button"
            onClick={addOutput}
            className="p-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md hover:bg-emerald-100 transition-colors"
            title="Adicionar Saída"
          >
            <Plus size={10} />
          </button>
        </div>

        {outputs.map((output: string, index: number) => (
          <div key={index} className="relative flex items-center group">
            <div className="flex-1 flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded p-1 mr-6">
              <input 
                type="text"
                value={output}
                onChange={(e) => updateOutputName(index, e.target.value)}
                className="bg-transparent text-[10px] w-full focus:outline-none"
              />
              {outputs.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeOutput(index)}
                  className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`out-${index}`}
              className="w-3 h-3 bg-emerald-500"
              style={{ top: '50%', right: -8 }}
            />
          </div>
        ))}
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
};

export const VariableNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 border-purple-500 min-w-[180px]">
      <div className="flex items-center border-b border-gray-100 dark:border-zinc-700 pb-1 mb-2">
        {getNodeIcon('logic', 'setVariable')}
        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{data.label || 'Definir Variável'}</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Nome da Variável</label>
          <input 
            type="text"
            placeholder="Ex: pontuacao_total"
            className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
            value={data.variableName || ''}
            onChange={(e) => data.onDataChange?.({ variableName: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Valor</label>
          <input 
            type="text"
            placeholder="Ex: 0 ou {{outra_var}}"
            className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
            value={data.value || ''}
            onChange={(e) => data.onDataChange?.({ value: e.target.value })}
          />
        </div>
        <p className="text-[9px] text-gray-400 italic">
          Esta variável ficará disponível em todos os níveis.
        </p>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};

export const EventNode = ({ data }: any) => {
  const elements = data.availableElements || [];
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 border-yellow-500 min-w-[192px]">
      <div className="flex items-center border-b border-gray-100 dark:border-zinc-700 pb-1 mb-2">
        {getNodeIcon('trigger', data.triggerType)}
        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{data.label || 'Gatilho'}</span>
      </div>
      
      <div className="space-y-3">
        {(data.triggerType === 'onClick' || data.triggerType === 'onHover' || data.triggerType === 'onBlur' || data.triggerType === 'onOverlap' || data.triggerType === 'onSeparate') && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Elemento Origem</label>
            <select 
              className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
              value={data.elementId || ''}
              onChange={(e) => data.onDataChange?.({ elementId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {elements.map((el: any) => (
                <option key={el.id} value={el.id}>{el.name || `${el.type} (${el.id.substring(0,4)})`}</option>
              ))}
            </select>
          </div>
        )}

        {(data.triggerType === 'onOverlap' || data.triggerType === 'onSeparate') && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">
              {data.triggerType === 'onOverlap' ? 'Ao encostar em' : 'Ao desencostar de'}
            </label>
            <select 
              className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
              value={data.targetElementId || ''}
              onChange={(e) => data.onDataChange?.({ targetElementId: e.target.value })}
            >
              <option value="">Qualquer elemento</option>
              {elements.map((el: any) => (
                <option key={el.id} value={el.id}>{el.name || `${el.type} (${el.id.substring(0,4)})`}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-500" />
    </div>
  );
};

export const ActionNode = ({ data }: any) => {
  const elements = data.availableElements || [];
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 border-blue-500 min-w-[192px]">
      <div className="flex items-center border-b border-gray-100 dark:border-zinc-700 pb-1 mb-2">
        {getNodeIcon('action', data.actionType)}
        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{data.label || 'Ação'}</span>
      </div>

      <div className="space-y-3">
        {data.actionType === 'setProperty' && (
          <>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Elemento Alvo</label>
              <select 
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.targetElementId || ''}
                onChange={(e) => data.onDataChange?.({ targetElementId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {elements.map((el: any) => (
                  <option key={el.id} value={el.id}>{el.name || `${el.type} (${el.id.substring(0,4)})`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Propriedade</label>
              <select 
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.property || 'visibility'}
                onChange={(e) => data.onDataChange?.({ property: e.target.value })}
              >
                <option value="visibility">Visibilidade (hidden/visible)</option>
                <option value="opacity">Opacidade (0-1)</option>
                <option value="backgroundColor">Cor de Fundo</option>
                <option value="color">Cor do Texto</option>
                <option value="fontSize">Tamanho da Fonte</option>
                <option value="text">Conteúdo do Texto</option>
                <option value="x">Posição X (%)</option>
                <option value="y">Posição Y (%)</option>
                <option value="width">Largura (px)</option>
                <option value="height">Altura (px)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Novo Valor</label>
              {data.property === 'visibility' ? (
                <select 
                  className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                  value={data.value || 'visible'}
                  onChange={(e) => data.onDataChange?.({ value: e.target.value })}
                >
                  <option value="visible">Visível</option>
                  <option value="hidden">Oculto</option>
                </select>
              ) : data.property === 'opacity' ? (
                <input 
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                  value={data.value || '1'}
                  onChange={(e) => data.onDataChange?.({ value: e.target.value })}
                />
              ) : (data.property === 'backgroundColor' || data.property === 'color') ? (
                <div className="flex gap-2">
                  <input 
                    type="color"
                    className="w-8 h-8 p-0 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 overflow-hidden cursor-pointer"
                    value={data.value && data.value.startsWith('#') ? data.value : '#000000'}
                    onChange={(e) => data.onDataChange?.({ value: e.target.value })}
                  />
                  <input 
                    type="text"
                    className="flex-1 text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                    value={data.value || ''}
                    placeholder="#RRGGBB"
                    onChange={(e) => data.onDataChange?.({ value: e.target.value })}
                  />
                </div>
              ) : (data.property === 'x' || data.property === 'y' || data.property === 'width' || data.property === 'height' || data.property === 'fontSize') ? (
                <input 
                  type="number"
                  className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                  value={data.value || ''}
                  onChange={(e) => data.onDataChange?.({ value: e.target.value })}
                />
              ) : (
                <input 
                  type="text"
                  placeholder="Novo valor..."
                  className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                  value={data.value || ''}
                  onChange={(e) => data.onDataChange?.({ value: e.target.value })}
                />
              )}
            </div>
          </>
        )}

        {data.actionType === 'move' && (
          <>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Elemento Alvo</label>
              <select 
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.targetElementId || ''}
                onChange={(e) => data.onDataChange?.({ targetElementId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {elements.map((el: any) => (
                  <option key={el.id} value={el.id}>{el.name || `${el.type} (${el.id.substring(0,4)})`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Direção</label>
              <select 
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.direction || 'right'}
                onChange={(e) => data.onDataChange?.({ direction: e.target.value })}
              >
                <option value="right">Direita</option>
                <option value="left">Esquerda</option>
                <option value="up">Cima</option>
                <option value="down">Baixo</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Distância (px)</label>
              <input 
                type="number"
                placeholder="Ex: 100"
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.value || ''}
                onChange={(e) => data.onDataChange?.({ value: e.target.value })}
              />
            </div>
          </>
        )}

        {data.actionType === 'saveToVariable' && (
          <>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Elemento de Entrada</label>
              <select 
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.targetElementId || ''}
                onChange={(e) => data.onDataChange?.({ targetElementId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {elements.filter((el: any) => el.type === 'input').map((el: any) => (
                  <option key={el.id} value={el.id}>{el.name || `Input (${el.id.substring(0,4)})`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Nome da Variável</label>
              <input 
                type="text"
                placeholder="Ex: nome_usuario"
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.variableName || ''}
                onChange={(e) => data.onDataChange?.({ variableName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Valor Fixo / Padrão</label>
              <input 
                type="text"
                placeholder="Valor manual ou padrão..."
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.value || ''}
                onChange={(e) => data.onDataChange?.({ value: e.target.value })}
              />
            </div>
          </>
        )}

        {data.actionType === 'playSound' && (
           <div>
             <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Configuração</label>
             <button 
               type="button"
               className="w-full text-[10px] p-2 border border-dashed border-gray-300 dark:border-zinc-700 rounded bg-gray-50 dark:bg-zinc-900 text-gray-500 hover:border-blue-500"
               onClick={() => data.onOpenMediaLibrary?.('audio', (b64: string) => data.onDataChange?.({ value: b64 }))}
             >
               {data.value ? 'Som Selecionado ✓' : 'Clique para Selecionar'}
             </button>
           </div>
        )}

        {data.actionType === 'goToLevel' && (
           <div className="space-y-3">
             <div>
               <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Nível Alvo</label>
               <select 
                 className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                 value={data.value || ''}
                 onChange={(e) => data.onDataChange?.({ value: e.target.value })}
               >
                 <option value="">Selecione o nível...</option>
                 {(data.availableLevels || []).map((level: any) => (
                   <option key={level.id} value={level.id}>{level.name}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Transição</label>
               <select 
                 className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                 value={data.transition || 'fade'}
                 onChange={(e) => data.onDataChange?.({ transition: e.target.value })}
               >
                 <option value="none">Nenhuma</option>
                 <option value="fade">Esmaecer (Fade)</option>
                 <option value="slide-left">Deslizar para Esquerda</option>
                 <option value="slide-right">Deslizar para Direita</option>
                 <option value="slide-up">Deslizar para Cima</option>
                 <option value="slide-down">Deslizar para Baixo</option>
                 <option value="zoom">Zoom</option>
                 <option value="flip">Giro (Flip)</option>
               </select>
             </div>
           </div>
        )}

        {data.actionType === 'goToSuccess' && (
           <div className="text-[10px] text-gray-400 bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-100 dark:border-zinc-700 italic">
             Transição direta para a tela de sucesso deste nível.
           </div>
        )}

        {data.actionType === 'goToError' && (
           <div className="text-[10px] text-gray-400 bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-100 dark:border-zinc-700 italic">
             Transição direta para a tela de erro deste nível.
           </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export const AnimationNode = ({ data }: any) => {
  const elements = data.availableElements || [];
  
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 border-cyan-500 min-w-[192px]">
      <div className="flex items-center border-b border-gray-100 dark:border-zinc-700 pb-1 mb-2">
        {getNodeIcon('animation', 'animate')}
        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{data.label || 'Animação'}</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Elemento Alvo</label>
          <select 
            className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
            value={data.targetElementId || ''}
            onChange={(e) => data.onDataChange?.({ targetElementId: e.target.value })}
          >
            <option value="">Selecione...</option>
            {elements.map((el: any) => (
              <option key={el.id} value={el.id}>{el.name || `${el.type} (${el.id.substring(0,4)})`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Efeito</label>
          <select 
            className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
            value={data.value || 'pulse'}
            onChange={(e) => data.onDataChange?.({ value: e.target.value })}
          >
            <option value="float">Flutuar</option>
            <option value="pulse">Pulsar</option>
            <option value="shake">Tremer</option>
            <option value="spin">Girar</option>
            <option value="bounce">Pular</option>
          </select>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-500" />
    </div>
  );
};

export const LogicNode = ({ data }: any) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-zinc-800 border-2 border-purple-500 min-w-[180px]">
      <div className="flex items-center border-b border-gray-100 dark:border-zinc-700 pb-1 mb-2">
        {getNodeIcon('logic', data.logicType)}
        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{data.label || 'Lógica'}</span>
      </div>

      <div className="space-y-3">
        {(data.logicType === 'if' || data.logicType === 'ifElse') && (
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-zinc-700">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Valor A (ou {"{{var}}"})</label>
              <input 
                type="text"
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.leftValue || ''}
                placeholder="Ex: {{pontos}} ou {{el1.text}}"
                onChange={(e) => data.onDataChange?.({ leftValue: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Operador</label>
              <select 
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.operator || '=='}
                onChange={(e) => data.onDataChange?.({ operator: e.target.value })}
              >
                <option value="==">Igual a (==)</option>
                <option value="!=">Diferente de (!=)</option>
                <option value=">">Maior que (&gt;)</option>
                <option value="<">Menor que (&lt;)</option>
                <option value=">=">Maior ou Igual (&gt;=)</option>
                <option value="<=">Menor ou Igual (&lt;=)</option>
                <option value="contains">Contém</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Valor B (ou {"{{var}}"})</label>
              <input 
                type="text"
                className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
                value={data.rightValue || ''}
                placeholder="Ex: 100 ou {{el2.text}}"
                onChange={(e) => data.onDataChange?.({ rightValue: e.target.value })}
              />
            </div>
            
            <p className="text-[9px] text-gray-400 italic">
              Use {"{{var}}"} para variáveis ou {"{{id.prop}}"} para propriedades.
            </p>
          </div>
        )}

        {data.logicType === 'wait' && (
           <div className="mt-2">
             <label className="text-[10px] text-gray-400 block mb-1 uppercase font-bold">Tempo (segundos)</label>
             <input 
               type="number"
               placeholder="segundos"
               className="w-full text-xs p-1.5 rounded border border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
               value={data.value || ''}
               onChange={(e) => data.onDataChange?.({ value: e.target.value })}
             />
           </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      
      {(data.logicType === 'if' || data.logicType === 'ifElse' || data.logicType === 'random') ? (
        <div className="flex flex-col gap-2 mt-3">
          <div className="relative flex items-center justify-end">
            <span className="text-[10px] text-green-500 mr-2 font-bold uppercase">Sim</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id="true" 
              style={{ top: '50%', right: -8 }} 
              className="w-2.5 h-2.5 bg-green-500" 
            />
          </div>
          <div className="relative flex items-center justify-end">
            <span className="text-[10px] text-red-500 mr-2 font-bold uppercase">Não</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id="false" 
              style={{ top: '50%', right: -8 }} 
              className="w-2.5 h-2.5 bg-red-500" 
            />
          </div>
        </div>
      ) : (
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
      )}
    </div>
  );
};
