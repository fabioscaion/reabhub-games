"use client";

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { EventNode, ActionNode, LogicNode, AnimationNode, BroadcastNode, VariableNode } from './CustomNodes';
import { Save, X } from 'lucide-react';
import LogicSidebar from './LogicSidebar';

const nodeTypes = {
  trigger: EventNode,
  action: ActionNode,
  logic: LogicNode,
  animation: AnimationNode,
  broadcast: BroadcastNode,
  variable: VariableNode,
};

interface LogicEditorProps {
  initialNodes?: any[];
  initialEdges?: any[];
  onSave: (nodes: any[], edges: any[]) => void;
  onClose: () => void;
  elements: any[]; // List of elements in the current level to trigger events on
  focusElementId?: string;
  onOpenAudioLibrary?: (callback: (base64: string) => void) => void;
}

export default function LogicEditor({ 
  initialNodes = [], 
  initialEdges = [], 
  onSave, 
  onClose, 
  elements, 
  focusElementId,
  onOpenAudioLibrary 
}: LogicEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(initialEdges);
  const initializedRef = React.useRef<string | null>(null);

  // Memoize node change handler to avoid recreation
  const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Inject common data and handlers into nodes
  const nodesWithData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        availableElements: elements,
        onDataChange: (newData: any) => handleNodeDataChange(node.id, newData),
        onOpenAudioLibrary: onOpenAudioLibrary
      }
    }));
  }, [nodes, elements, handleNodeDataChange, onOpenAudioLibrary]);

  // Initialize nodes from initialNodes only once
  React.useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, []); // Run once on mount

  // Focus on specific element's trigger on mount
  React.useEffect(() => {
    if (focusElementId && initializedRef.current !== focusElementId) {
      // Find existing trigger for this element in the latest state or initial nodes
      const existingNode = nodes.find(n => 
        n.type === 'trigger' && 
        n.data.triggerType === 'onClick' && 
        n.data.elementId === focusElementId
      );

      if (existingNode) {
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === existingNode.id })));
        initializedRef.current = focusElementId;
      } else {
        // Create new trigger for this element
        const element = elements.find(el => el.id === focusElementId);
        if (element) {
          addEventNode('onClick', `Ao Clicar em: ${element.name || element.type}`, focusElementId);
          initializedRef.current = focusElementId;
        }
      }
    }
  }, [focusElementId, nodes, elements]); // Added nodes and elements to dependencies

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addEventNode = (type: string, label: string, elementId?: string) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'trigger', // Changed from 'event' to 'trigger' to match runner logic
      position: { x: 100, y: 100 },
      data: { 
        label, 
        triggerType: type,
        elementId: elementId
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addActionNode = (type: string, label: string) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'action',
      position: { x: 400, y: 100 },
      data: { label, actionType: type, value: '' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addAnimationNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'animation',
      position: { x: 400, y: 150 },
      data: { 
        label: 'Executar Animação',
        actionType: 'animate', // Keep actionType for runner compatibility
        value: 'pulse',
        targetElementId: ''
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addLogicNode = (type: string, label: string) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'logic',
      position: { x: 250, y: 100 },
      data: { 
        label, 
        logicType: type,
        leftValue: '',
        operator: '==',
        rightValue: ''
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addBroadcastNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'broadcast',
      position: { x: 250, y: 100 },
      data: { 
        label: 'Múltiplas Saídas',
        outputs: ['Saída 1', 'Saída 2']
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addVariableNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'variable',
      position: { x: 250, y: 100 },
      data: { 
        label: 'Definir Variável',
        variableName: '',
        value: ''
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-100 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold">Editor de Lógica Visual</h2>
        </div>
        <button
          onClick={() => onSave(nodes, edges)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Save size={18} />
          Salvar Lógica
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <LogicSidebar 
          elements={elements}
          addEventNode={addEventNode}
          addActionNode={addActionNode}
          addLogicNode={addLogicNode}
          addAnimationNode={addAnimationNode}
          addBroadcastNode={addBroadcastNode}
          addVariableNode={addVariableNode}
        />

        {/* Canvas */}
        <div className="flex-1 bg-gray-50 dark:bg-zinc-950">
          <ReactFlow
            nodes={nodesWithData}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            minZoom={0.2}
            maxZoom={1.2}
            fitView
            fitViewOptions={{ maxZoom: 0.8, padding: 0.3 }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
