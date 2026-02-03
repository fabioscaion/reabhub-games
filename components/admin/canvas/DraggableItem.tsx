"use client";

import Image from "next/image";
import { Image as ImageIcon, Music, Trash2, Square } from "lucide-react";
import { Asset, DragItem, Level } from "@/types/game";

interface DraggableItemProps {
  item: DragItem;
  position: { x: number; y: number };
  content: Asset;
  isCorrect?: boolean;
  isSelected: boolean;
  isEditing: boolean;
  isDragging: boolean;
  resizingHandle: string | null;
  level: Level;
  onMouseDown: (e: React.MouseEvent, item: DragItem, position: { x: number; y: number }) => void;
  onContextMenu: (e: React.MouseEvent, item: DragItem) => void;
  onDoubleClick: (e: React.MouseEvent, item: DragItem) => void;
  onResizeStart: (e: React.MouseEvent, item: DragItem, direction: string, width: number, height: number, position: { x: number; y: number }) => void;
  onDelete: (item: DragItem) => void;
  onUpdate: (id: string, type: 'static' | 'option', updates: any) => void;
  onSetEditing: (id: string | null) => void;
}

export default function DraggableItem({
  item,
  position,
  content,
  isCorrect,
  isSelected,
  isEditing,
  isDragging,
  resizingHandle,
  level,
  onMouseDown,
  onContextMenu,
  onDoubleClick,
  onResizeStart,
  onDelete,
  onUpdate,
  onSetEditing
}: DraggableItemProps) {
  const currentWidth = content.style?.width || (content.type === 'image' ? 128 : 100);
  const currentHeight = content.style?.height || (content.type === 'image' ? 128 : (content.type === 'text' ? 50 : 100));

  return (
    <div
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        zIndex: (content.style?.zIndex || 10) + ((isDragging || !!resizingHandle) && isSelected ? 1000 : 0)
      }}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group`}
      onMouseDown={(e) => onMouseDown(e, item, position)}
      onContextMenu={(e) => onContextMenu(e, item)}
      onDoubleClick={(e) => onDoubleClick(e, item)}
    >
      <div className={`
        relative p-2 rounded-lg border-2
        ${isSelected ? 'border-blue-500 shadow-xl bg-white/10 backdrop-blur-sm' : 'border-transparent hover:border-gray-300'}
        ${isCorrect ? 'ring-2 ring-green-500' : ''}
      `}>
        {/* Game Type Badges */}
        {item.type === 'option' && (
           <>
             {(() => {
               const opt = level.options.find(o => o.id === item.id);
               if (opt?.matchId) {
                 return (
                   <div className="absolute -top-3 -right-2 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm z-20 font-bold border border-white pointer-events-none">
                      {opt.matchId}
                   </div>
                 );
               }
             })()}
             
             {(() => {
               const opt = level.options.find(o => o.id === item.id);
               if (opt?.order) {
                 return (
                   <div className="absolute -top-3 -right-2 bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-20 font-bold border border-white pointer-events-none">
                      {opt.order}
                   </div>
                 );
               }
             })()}
           </>
        )}
        {content.type === "image" ? (
          content.value ? (
            <div className="relative" style={{ width: content.style?.width || 128, height: content.style?.height || 128 }}>
              <Image draggable={false} src={content.value} alt={content.alt || ""} fill className="object-fill rounded-md" />
            </div>
          ) : (
            <div 
              className="bg-gray-200 dark:bg-zinc-800 rounded-md flex items-center justify-center"
              style={{ width: content.style?.width || 128, height: content.style?.height || 128 }}
            >
              <ImageIcon className="text-gray-400" />
            </div>
          )
        ) : content.type === "shape" ? (
           <div 
             style={{ 
               width: content.style?.width || 100, 
               height: content.style?.height || 100, 
               backgroundColor: content.style?.backgroundColor || '#3b82f6',
               borderWidth: `${content.style?.borderWidth || 0}px`,
               borderColor: content.style?.borderColor || '#000000',
               borderRadius: content.value === 'circle' ? '50%' : content.value === 'rounded' ? '1rem' : '0',
               clipPath: content.value === 'triangle' 
                 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                 : content.value === 'star' 
                 ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                 : undefined,
               display: 'grid',
               placeItems: 'center',
               overflow: 'hidden'
             }}
             className="shadow-sm"
           >
              <span 
                className="font-bold text-center w-full h-full flex items-center justify-center p-2 break-words overflow-hidden"
                style={{
                  color: content.style?.color || '#ffffff',
                  fontSize: content.style?.fontSize ? `${content.style.fontSize}px` : '14px',
                  fontFamily: content.style?.fontFamily,
                  visibility: isEditing ? 'hidden' : 'visible',
                  gridArea: '1 / 1 / 2 / 2',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {content.text || ""}
              </span>

              {isEditing && (
                <textarea
                  autoFocus
                  onMouseDown={(e) => e.stopPropagation()}
                  value={content.text || ""}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    onUpdate(item.id, item.type, { text: newVal });
                  }}
                  onBlur={() => onSetEditing(null)}
                  className="bg-transparent border-none outline-none w-full h-full p-2 m-0 resize-none overflow-hidden flex items-center justify-center"
                  style={{
                    color: content.style?.color || '#ffffff',
                    fontSize: content.style?.fontSize ? `${content.style.fontSize}px` : '14px',
                    fontFamily: content.style?.fontFamily,
                    textAlign: 'center',
                    gridArea: '1 / 1 / 2 / 2',
                    zIndex: 10,
                    paddingTop: content.style?.height ? `${(content.style.height / 2) - 20}px` : '20%',
                  }}
                />
              )}
           </div>
        ) : content.type === "audio" ? (
           <div 
             style={{ 
               width: content.style?.width || 48, 
               height: content.style?.height || 48,
               backgroundColor: '#10b981', // green-500
             }}
             className="rounded-full shadow-lg flex items-center justify-center text-white"
           >
              <Music size={(content.style?.width || 48) * 0.5} />
           </div>
        ) : content.type === "input" ? (
           <div 
             style={{ 
               width: content.style?.width || 200, 
               height: content.style?.height || 40,
               backgroundColor: content.style?.backgroundColor || '#ffffff',
               borderColor: content.style?.borderColor || '#cccccc',
               borderWidth: `${content.style?.borderWidth || 1}px`,
               color: content.style?.color || '#000000',
               fontSize: content.style?.fontSize ? `${content.style.fontSize}px` : '14px',
             }}
             className="rounded-md shadow-inner flex items-center px-3 text-gray-400 italic pointer-events-none border"
           >
              {content.value || "Digite aqui..." }
           </div>
        ) : (
          <div 
            className="px-4 py-2 rounded-md shadow-sm text-center grid place-items-center"
            style={{
              width: content.type === 'text' ? (content.style?.width ? `${content.style.width}px` : 'max-content') : (content.style?.width ? `${content.style.width}px` : 'auto'),
              height: content.type === 'text' ? 'max-content' : (content.style?.height ? `${content.style.height}px` : 'auto'),
              minWidth: content.type === 'text' ? 'min-content' : '100px',
              maxWidth: undefined,
              backgroundColor: content.style?.backgroundColor || (item.type === 'option' ? 'transparent' : undefined),
              borderColor: content.style?.borderColor || (item.type === 'option' ? 'transparent' : undefined),
              borderWidth: content.style?.borderWidth !== undefined ? `${content.style.borderWidth}px` : (item.type === 'option' ? '0px' : undefined),
              borderStyle: content.style?.borderWidth ? 'solid' : undefined,
              backgroundImage: content.style?.backgroundImage ? `url(${content.style.backgroundImage})` : undefined,
              backgroundSize: content.style?.backgroundSize || 'cover',
              backgroundPosition: content.style?.backgroundPosition || 'center',
              backgroundRepeat: content.style?.backgroundRepeat || 'no-repeat',
            }}
          >
              <span 
                className="font-medium w-full"
                style={{
                  color: content.style?.color,
                  fontSize: content.style?.fontSize ? `${content.style.fontSize}px` : '1.125rem',
                  fontFamily: content.style?.fontFamily,
                  fontWeight: content.style?.fontWeight || 'normal',
                  fontStyle: content.style?.fontStyle || 'normal',
                  textDecoration: content.style?.textDecoration || 'none',
                  textAlign: content.style?.textAlign as any || 'center',
                  display: 'block',
                  whiteSpace: content.style?.width ? 'pre-wrap' : 'pre',
                  wordBreak: 'break-word',
                  visibility: isEditing ? 'hidden' : 'visible',
                  gridArea: '1 / 1 / 2 / 2',
                }}
              >
                {content.value || " "}
              </span>

            {isEditing && (
              <textarea
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
                value={content.value}
                onChange={(e) => {
                  const newVal = e.target.value;
                  onUpdate(item.id, item.type, { value: newVal, style: { ...content.style, height: undefined } });
                }}
                onBlur={() => onSetEditing(null)}
                className="bg-transparent border-none outline-none w-full h-full p-0 m-0 resize-none overflow-hidden"
                style={{
                  color: content.style?.color,
                  fontSize: content.style?.fontSize ? `${content.style.fontSize}px` : '1.125rem',
                  fontFamily: content.style?.fontFamily,
                  fontWeight: content.style?.fontWeight || 'normal',
                  fontStyle: content.style?.fontStyle || 'normal',
                  textDecoration: content.style?.textDecoration || 'none',
                  textAlign: content.style?.textAlign as any || 'center',
                  whiteSpace: content.style?.width ? 'pre-wrap' : 'pre',
                  wordBreak: 'break-word',
                  gridArea: '1 / 1 / 2 / 2',
                }}
              />
            )}
          </div>
        )}
        
        {/* Resize Handles */}
        {isSelected && (
          <>
            {/* Corners */}
            <div
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-nw-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'nw', currentWidth, currentHeight, position)}
            />
            <div
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-ne-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'ne', currentWidth, currentHeight, position)}
            />
            <div
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 cursor-sw-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'sw', currentWidth, currentHeight, position)}
            />
            <div
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 cursor-se-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'se', currentWidth, currentHeight, position)}
            />
            
            {/* Sides */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-n-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'n', currentWidth, currentHeight, position)}
            />
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 cursor-s-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 's', currentWidth, currentHeight, position)}
            />
            <div
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 cursor-w-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'w', currentWidth, currentHeight, position)}
            />
            <div
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 cursor-e-resize z-50"
              onMouseDown={(e) => onResizeStart(e, item, 'e', currentWidth, currentHeight, position)}
            />
          </>
        )}

        {/* Delete Button (only visible when selected) */}
        {isSelected && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-[60]"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
