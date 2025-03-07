import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import Card from './Card';
import NotesPanel from './NotesPanel';
import { CardPosition, ConnectionPuzzle, ConnectionGroup } from '../types/connections';
import { getRandomPuzzle } from '../services/connectionsService';

const BoardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #ddd;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3a80d2;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ColorSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ColorButton = styled.button<{ color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background-color: ${props => props.color};
  cursor: pointer;
  
  &:hover {
    border-color: #999;
  }
`;

const GameBoard: React.FC = () => {
  const [cards, setCards] = useState<CardPosition[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [completedGroups, setCompletedGroups] = useState<ConnectionGroup[]>([]);
  const [currentColor, setCurrentColor] = useState<'yellow' | 'green' | 'blue' | 'purple' | null>(null);
  const [puzzle, setPuzzle] = useState<ConnectionPuzzle | null>(null);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const randomPuzzle = await getRandomPuzzle();
        setPuzzle(randomPuzzle);
        
        // Initialize cards in a grid layout
        const allWords = randomPuzzle.groups.flatMap(group => group.words);
        const initialCards: CardPosition[] = allWords.map((word, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          return {
            id: `card-${index}`,
            text: word,
            x: 50 + col * 170,
            y: 50 + row * 80,
            color: null
          };
        });
        
        setCards(initialCards);
      } catch (error) {
        console.error('Failed to load puzzle:', error);
      }
    };
    
    loadPuzzle();
  }, []);

  const [, drop] = useDrop(() => ({
    accept: 'card',
    drop: (item: { id: string; x: number; y: number }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const x = Math.round(item.x + delta.x);
        const y = Math.round(item.y + delta.y);
        moveCard(item.id, x, y);
      }
    },
  }));

  const moveCard = (id: string, x: number, y: number) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, x, y } : card
    ));
  };

  const handleCardClick = (id: string) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(cardId => cardId !== id));
    } else {
      if (selectedCards.length < 4) {
        setSelectedCards([...selectedCards, id]);
      }
    }
  };

  const applyColorToSelected = (color: 'yellow' | 'green' | 'blue' | 'purple') => {
    setCards(cards.map(card => 
      selectedCards.includes(card.id) ? { ...card, color } : card
    ));
    setCurrentColor(color);
  };

  const resetSelection = () => {
    setSelectedCards([]);
    setCurrentColor(null);
  };

  const checkSelection = () => {
    if (selectedCards.length !== 4 || !puzzle) return;
    
    const selectedTexts = selectedCards.map(id => 
      cards.find(card => card.id === id)?.text
    ).filter(Boolean) as string[];
    
    // Check if the selection matches any group
    const matchedGroup = puzzle.groups.find(group => 
      selectedTexts.every(text => group.words.includes(text)) && 
      selectedTexts.length === group.words.length
    );
    
    if (matchedGroup) {
      setCompletedGroups([...completedGroups, matchedGroup]);
      
      // Remove completed cards
      setCards(cards.filter(card => !selectedCards.includes(card.id)));
      setSelectedCards([]);
    } else {
      // Indicate wrong selection
      alert('Not a valid group. Try again!');
      resetSelection();
    }
  };

  return (
    <>
      <ControlPanel>
        <div>
          <Button onClick={resetSelection}>Reset Selection</Button>
          <Button 
            onClick={checkSelection} 
            disabled={selectedCards.length !== 4}
          >
            Check Selection
          </Button>
        </div>
        <ColorSelector>
          <ColorButton 
            color="#f7da21" 
            onClick={() => applyColorToSelected('yellow')} 
          />
          <ColorButton 
            color="#78c47d" 
            onClick={() => applyColorToSelected('green')} 
          />
          <ColorButton 
            color="#6aadea" 
            onClick={() => applyColorToSelected('blue')} 
          />
          <ColorButton 
            color="#a86cce" 
            onClick={() => applyColorToSelected('purple')} 
          />
        </ColorSelector>
      </ControlPanel>
      
      <BoardContainer ref={drop}>
        {cards.map(card => (
          <Card 
            key={card.id}
            card={card}
            isSelected={selectedCards.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </BoardContainer>
      
      <div>
        <h3>Completed Groups:</h3>
        {completedGroups.map((group, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: group.color === 'yellow' ? '#f7da21' : 
                         group.color === 'green' ? '#78c47d' : 
                         group.color === 'blue' ? '#6aadea' : '#a86cce' }}>
              {group.category}
            </h4>
            <p>{group.words.join(', ')}</p>
          </div>
        ))}
      </div>
      
      <NotesPanel 
        notes={notes}
        onNotesChange={setNotes}
      />
    </>
  );
};

export default GameBoard; 