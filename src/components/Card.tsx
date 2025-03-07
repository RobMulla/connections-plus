import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';
import { CardPosition } from '../types/connections';

interface CardProps {
  card: CardPosition;
  isSelected: boolean;
  onClick: () => void;
}

const CardContainer = styled.div<{ 
  isDragging: boolean; 
  isSelected: boolean; 
  color: string | null | undefined;
  left: number;
  top: number;
}>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  width: 150px;
  height: 60px;
  background-color: ${props => {
    if (props.isSelected) return '#f0f0f0';
    if (props.color === 'yellow') return '#f7da21';
    if (props.color === 'green') return '#78c47d';
    if (props.color === 'blue') return '#6aadea';
    if (props.color === 'purple') return '#a86cce';
    return 'white';
  }};
  border: 2px solid ${props => props.isSelected ? '#333' : '#ddd'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  cursor: grab;
  user-select: none;
  box-shadow: ${props => props.isDragging ? '0 5px 10px rgba(0, 0, 0, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.1)'};
  transition: box-shadow 0.2s, transform 0.1s;
  
  &:hover {
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const Card: React.FC<CardProps> = ({ card, isSelected, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: { id: card.id, x: card.x, y: card.y },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <CardContainer
      ref={drag}
      isDragging={isDragging}
      isSelected={isSelected}
      color={card.color}
      left={card.x}
      top={card.y}
      onClick={onClick}
    >
      {card.text}
    </CardContainer>
  );
};

export default Card; 