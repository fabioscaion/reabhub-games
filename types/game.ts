export type GameType = 'naming' | 'comprehension' | 'association' | 'sequencing' | 'memory';

export interface GameEvent {
  trigger: 'click' | 'hover' | 'onOverlap' | 'onSeparate';
  action: 'playSound' | 'goToLevel' | 'goToSuccess' | 'goToError';
  value: string; // Audio base64/URL or Level ID
  transition?: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'flip';
}

export interface Asset {
  type: 'image' | 'text' | 'audio' | 'shape' | 'input';
  value: string; // URL, text content, or shape type (circle, square, triangle, star)
  text?: string; // Optional text to display inside a shape
  name?: string; // User-defined name for the element
  alt?: string;
  interactionAudio?: string; // Audio played when the asset is clicked/interacted with
  events?: GameEvent[];
  animation?: 'none' | 'float' | 'pulse' | 'shake' | 'spin' | 'bounce';
  tag?: string;
  draggable?: boolean;
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: 'none' | 'underline' | 'line-through';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    width?: number;
    height?: number;
    zIndex?: number;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    translateX?: number;
    translateY?: number;
    opacity?: number;
    visibility?: 'visible' | 'hidden';
  };
}

export interface Option {
  id: string;
  content: Asset;
  isCorrect: boolean;
  order?: number; // For sequencing games
  matchId?: string; // For memory games
  feedback?: string; // Optional feedback message
  position?: { x: number; y: number }; // Percentage position (0-100)
  targetLevelId?: string; // For menu levels: ID of the level to navigate to
  tag?: string;
}

export interface Level {
  id: string;
  name?: string;
  type?: 'game' | 'info' | 'menu'; // 'game' (default), 'info' (transition), 'menu' (navigation)
  stimulus?: Asset & { position?: { x: number; y: number } }; // The main item displayed
  options: Option[];
  staticElements?: (Asset & { id: string; position: { x: number; y: number } })[]; // Decorative elements (text/images)
  showChecklist?: boolean; // Show checklist of correct options
  backgroundAudio?: string; // Optional background music/audio for the level
  logic?: {
    nodes: any[];
    edges: any[];
  };
  style?: {
    backgroundColor?: string;
    backgroundImage?: string;
  };
  successScreen?: {
    staticElements?: (Asset & { id: string; position: { x: number; y: number } })[];
    style?: { backgroundColor?: string; backgroundImage?: string; };
  };
  errorScreen?: {
    staticElements?: (Asset & { id: string; position: { x: number; y: number } })[];
    style?: { backgroundColor?: string; backgroundImage?: string; };
  };
}

export interface GameConfig {
  id: string;
  name: string;
  description?: string;
  type: GameType;
  category: string;
  coverImage?: string;
  status: 'draft' | 'published';
  levels: Level[];
  isPublic?: boolean;
  userId?: string;
  organizationId?: string;
}

export type DragItem = { type: "option"; id: string } | { type: "static"; id: string };
