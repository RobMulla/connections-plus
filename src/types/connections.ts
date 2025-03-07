export interface ConnectionGroup {
  category: string;
  words: string[];
  color: 'yellow' | 'green' | 'blue' | 'purple';
}

export interface ConnectionPuzzle {
  date: string;
  groups: ConnectionGroup[];
}

export interface CardPosition {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | null;
  groupId?: number;
}

export interface GameState {
  cards: CardPosition[];
  selectedCards: string[];
  completedGroups: ConnectionGroup[];
  notes: string;
  puzzleDate: string;
} 