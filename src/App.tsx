import React from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GameBoard from './components/GameBoard';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
`;

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer>
        <Header>
          <Title>Connections Plus</Title>
          <Subtitle>A better UI for solving the NYT Connections game</Subtitle>
        </Header>
        <GameBoard />
      </AppContainer>
    </DndProvider>
  );
};

export default App; 