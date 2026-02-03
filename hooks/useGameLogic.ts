import { useState, useCallback, useRef, useEffect } from "react";
import { GameConfig } from "@/types/game";

interface UseGameLogicProps {
  config: GameConfig;
  currentLevelIndex: number;
  setCurrentLevelIndex: (index: number | ((prev: number) => number)) => void;
  onLevelComplete?: () => void;
  onGameFinished?: () => void;
}

export function useGameLogic({
  config,
  currentLevelIndex,
  setCurrentLevelIndex,
  onLevelComplete,
  onGameFinished
}: UseGameLogicProps) {
  const [activeAnimations, setActiveAnimations] = useState<Record<string, string>>({});
  const [propertyOverrides, setPropertyOverrides] = useState<Record<string, Record<string, any>>>({});
  const [globalVariables, setGlobalVariables] = useState<Record<string, any>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Use refs to avoid circular dependencies in executeLogic
  const globalVariablesRef = useRef(globalVariables);
  const inputValuesRef = useRef(inputValues);
  const propertyOverridesRef = useRef(propertyOverrides);
  const currentLevelRef = useRef(config.levels[currentLevelIndex]);

  useEffect(() => {
    globalVariablesRef.current = globalVariables;
  }, [globalVariables]);

  useEffect(() => {
    inputValuesRef.current = inputValues;
  }, [inputValues]);

  useEffect(() => {
    propertyOverridesRef.current = propertyOverrides;
  }, [propertyOverrides]);

  useEffect(() => {
    currentLevelRef.current = config.levels[currentLevelIndex];
  }, [config.levels, currentLevelIndex]);

  const onLevelCompleteRef = useRef(onLevelComplete);
  const onGameFinishedRef = useRef(onGameFinished);
  const configRef = useRef(config);

  useEffect(() => {
    onLevelCompleteRef.current = onLevelComplete;
    onGameFinishedRef.current = onGameFinished;
    configRef.current = config;
  }, [onLevelComplete, onGameFinished, config]);

  const resetLevelState = useCallback(() => {
    setActiveAnimations({});
    setPropertyOverrides({});
    setInputValues({});
  }, []);

  const handleNextLevel = useCallback(() => {
    const config = configRef.current;
    if (currentLevelIndex < config.levels.length - 1) {
      setCurrentLevelIndex((prev) => (typeof prev === 'number' ? prev + 1 : prev));
      resetLevelState();
      if (onLevelCompleteRef.current) onLevelCompleteRef.current();
    } else {
      if (onGameFinishedRef.current) onGameFinishedRef.current();
    }
  }, [currentLevelIndex, setCurrentLevelIndex, resetLevelState]);

  const handleNextLevelRef = useRef(handleNextLevel);
  useEffect(() => {
    handleNextLevelRef.current = handleNextLevel;
  }, [handleNextLevel]);

  const getMergedElement = useCallback((element: any) => {
    let merged = { ...element };
    
    const overrides = propertyOverrides[element.id];
    if (overrides) {
      if (overrides.text !== undefined) {
        if (merged.type === 'shape') {
          merged.text = overrides.text;
        } else {
          merged.value = overrides.text;
        }
      }
      if (overrides.x !== undefined) merged.position = { ...merged.position, x: Number(overrides.x) };
      if (overrides.y !== undefined) merged.position = { ...merged.position, y: Number(overrides.y) };

      const styleProps = ['backgroundColor', 'color', 'fontSize', 'opacity', 'width', 'height', 'visibility', 'translateX', 'translateY'];
      const numericProps = ['fontSize', 'opacity', 'width', 'height', 'translateX', 'translateY'];
      
      styleProps.forEach(prop => {
        if (overrides[prop] !== undefined) {
          let val = overrides[prop];
          if (numericProps.includes(prop)) {
            val = Number(val);
          }
          merged.style = { ...merged.style, [prop]: val };
        }
      });
    }

    if ((merged.type === 'text' && typeof merged.value === 'string') || (merged.type === 'shape' && typeof merged.text === 'string')) {
      let finalValue = merged.type === 'shape' ? (merged.text || '') : merged.value;
      Object.entries(globalVariables).forEach(([key, val]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        finalValue = finalValue.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g'), String(val ?? ''));
      });
      
      if (merged.type === 'shape') {
        merged.text = finalValue;
      } else {
        merged.value = finalValue;
      }
    }

    return merged;
  }, [propertyOverrides, globalVariables]);

  const executeLogic = useCallback(async (triggerType: string, triggerData?: any) => {
    const currentLevel = currentLevelRef.current;
    if (!currentLevel?.logic?.nodes || !currentLevel?.logic?.edges) return;

    const { nodes, edges } = currentLevel.logic;

    // Create a local copy of variables and overrides for this execution flow
    let localVariables = { ...globalVariablesRef.current };
    let localOverrides = { ...propertyOverridesRef.current };

    const replaceVariables = (text: string) => {
      if (typeof text !== 'string') return text;
      let result = text;
      
      // Replace variables
      Object.entries(localVariables).forEach(([key, val]) => {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g'), String(val ?? ''));
      });

      // Replace element properties: {{elementId.property}}
      const propertyRegex = /\{\{([^.]+)\.([^}]+)\}\}/g;
      result = result.replace(propertyRegex, (match, elementId, property) => {
        const allElements = [
          ...(currentLevel.options || []).map(o => ({ ...o.content, id: o.id, position: o.position })),
          ...(currentLevel.staticElements || [])
        ];
        const element = allElements.find(el => el.id === elementId);
        if (!element) return match;
        
        // Use localOverrides for immediate feedback within the same execution flow
        const overrides = localOverrides[element.id];
        let merged: any = { ...element };
        
        if (overrides) {
          if (overrides.text !== undefined) {
            if (merged.type === 'shape') merged.text = overrides.text;
            else merged.value = overrides.text;
          }
          if (overrides.x !== undefined) merged.position = { x: Number(overrides.x), y: merged.position?.y ?? 0 };
          if (overrides.y !== undefined) merged.position = { x: merged.position?.x ?? 0, y: Number(overrides.y) };

          const styleProps = ['backgroundColor', 'color', 'fontSize', 'opacity', 'width', 'height', 'visibility', 'translateX', 'translateY'];
          styleProps.forEach(prop => {
            if (overrides[prop] !== undefined) {
              if (!merged.style) merged.style = {};
              merged.style[prop] = overrides[prop];
            }
          });
        }
        
        // Handle special cases for property names
        if (property === 'text') return String(merged.text || merged.value || '');
        if (property === 'x') return String(merged.position?.x ?? 0);
        if (property === 'y') return String(merged.position?.y ?? 0);
        
        return String(merged[property] ?? merged.style?.[property] ?? '');
      });

      return result;
    };

    // Find all matching trigger nodes
    const matchingTriggerNodes = nodes.filter(n => 
      n.type === 'trigger' && 
      n.data.triggerType === triggerType &&
      (
        (triggerType === 'onClick' && (!n.data.elementId || n.data.elementId === triggerData?.id)) ||
        (triggerType === 'onOverlap' && 
          (!n.data.elementId || n.data.elementId === triggerData?.id) && 
          (!n.data.targetElementId || n.data.targetElementId === triggerData?.targetId)
        ) ||
        (triggerType !== 'onClick' && triggerType !== 'onOverlap')
      )
    );

    if (matchingTriggerNodes.length === 0) return;

    // Recursive function to execute nodes
    const executeNode = async (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      const outgoingEdges = edges.filter(e => e.source === nodeId);

      if (node.type === 'action' || node.type === 'animation') {
        const { actionType, targetElementId } = node.data;
        const value = replaceVariables(node.data.value);
        
        if (actionType === 'playSound' && value) {
          const audio = new Audio(value);
          audio.play().catch(err => console.error("Error playing logic audio:", err));
        } else if (actionType === 'goToLevel' && value) {
          const config = configRef.current;
          const targetIndex = config.levels.findIndex(l => l.id === value);
          if (targetIndex !== -1) {
            setCurrentLevelIndex(targetIndex);
            resetLevelState();
            return;
          }
        } else if (actionType === 'animate' && value) {
          const elementId = targetElementId;
          const animation = value;
          if (elementId && animation) {
            setActiveAnimations(prev => ({ ...prev, [elementId]: animation }));
          }
        } else if (actionType === 'setProperty' && targetElementId && node.data.property) {
          const { property } = node.data;
          const propValue = replaceVariables(node.data.value);
          
          // Update local overrides for immediate feedback
          if (!localOverrides[targetElementId]) localOverrides[targetElementId] = {};
          localOverrides[targetElementId][property] = propValue;

          setPropertyOverrides(prev => ({
            ...prev,
            [targetElementId]: {
              ...(prev[targetElementId] || {}),
              [property]: propValue
            }
          }));
        } else if (actionType === 'move' && targetElementId && node.data.direction) {
          const { direction } = node.data;
          const distance = Number(replaceVariables(node.data.value)) || 0;
          
          // Calculate new values locally
          const current = localOverrides[targetElementId] || {};
          const currentTX = Number(current.translateX || 0);
          const currentTY = Number(current.translateY || 0);
          
          let newTX = currentTX;
          let newTY = currentTY;
          
          if (direction === 'right') newTX += distance;
          if (direction === 'left') newTX -= distance;
          if (direction === 'down') newTY += distance;
          if (direction === 'up') newTY -= distance;

          // Update local overrides
          localOverrides[targetElementId] = {
            ...current,
            translateX: newTX,
            translateY: newTY
          };
          
          setPropertyOverrides(prev => ({
            ...prev,
            [targetElementId]: {
              ...(prev[targetElementId] || {}),
              translateX: newTX,
              translateY: newTY
            }
          }));
        } else if (actionType === 'saveToVariable' && node.data.variableName) {
          const varName = node.data.variableName;
          const defaultValue = replaceVariables(node.data.value || '');
          const inputValue = targetElementId ? (inputValuesRef.current[targetElementId] || '') : '';
          
          const finalValue = inputValue || defaultValue;
          localVariables[varName] = finalValue;
          setGlobalVariables(prev => ({ ...prev, [varName]: finalValue }));
        } else if (actionType === 'completeLevel') {
            if (handleNextLevelRef.current) handleNextLevelRef.current();
            return;
          }
        } else if (node.type === 'logic') {
        const { logicType } = node.data;
        const value = replaceVariables(node.data.value);
        
        if (logicType === 'wait' && value) {
          await new Promise(resolve => setTimeout(resolve, Number(value) * 1000));
        } else if (logicType === 'if' || logicType === 'ifElse' || logicType === 'random') {
          let condition = true;
          if (logicType === 'random') {
            condition = Math.random() > 0.5;
          } else if (logicType === 'if' || logicType === 'ifElse') {
            const leftVal = replaceVariables(node.data.leftValue || '');
            const rightVal = replaceVariables(node.data.rightValue || '');
            const op = node.data.operator || '==';

            switch (op) {
              case '==': condition = leftVal == rightVal; break;
              case '!=': condition = leftVal != rightVal; break;
              case '>':  condition = Number(leftVal) > Number(rightVal); break;
              case '<':  condition = Number(leftVal) < Number(rightVal); break;
              case '>=': condition = Number(leftVal) >= Number(rightVal); break;
              case '<=': condition = Number(leftVal) <= Number(rightVal); break;
              case 'contains': condition = String(leftVal).includes(String(rightVal)); break;
              default: condition = leftVal == rightVal;
            }
          }
          
          const trueEdge = outgoingEdges.find(e => e.sourceHandle === 'true');
          const falseEdge = outgoingEdges.find(e => e.sourceHandle === 'false');

          if (condition && trueEdge) {
            await executeNode(trueEdge.target);
            return;
          } else if (!condition && falseEdge) {
            await executeNode(falseEdge.target);
            return;
          }
        }
      } else if (node.type === 'broadcast') {
        // Broadcast nodes execute all outgoing paths in parallel
        await Promise.all(outgoingEdges.map(edge => executeNode(edge.target)));
        return;
      } else if (node.type === 'variable') {
        const { variableName } = node.data;
        const value = replaceVariables(node.data.value || '');
        if (variableName) {
          localVariables[variableName] = value;
          setGlobalVariables(prev => ({ ...prev, [variableName]: value }));
        }
      }

      for (const edge of outgoingEdges) {
        if (node.type === 'logic' && (node.data.logicType === 'ifElse' || node.data.logicType === 'if' || node.data.logicType === 'random')) continue;
        await executeNode(edge.target);
      }
    };

    // Execute all matching triggers
    for (const triggerNode of matchingTriggerNodes) {
      const initialEdges = edges.filter(e => e.source === triggerNode.id);
      for (const edge of initialEdges) {
        await executeNode(edge.target);
      }
    }
  }, [setCurrentLevelIndex, resetLevelState]);

  const handleInputChange = useCallback((id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  }, []);

  return {
    activeAnimations,
    setActiveAnimations,
    propertyOverrides,
    setPropertyOverrides,
    globalVariables,
    setGlobalVariables,
    inputValues,
    setInputValues,
    executeLogic,
    getMergedElement,
    handleInputChange,
    resetLevelState,
    handleNextLevel
  };
}
