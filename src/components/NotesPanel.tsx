import React, { useState } from 'react';
import styled from 'styled-components';

const NotesContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const NotesTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
`;

interface NotesPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onNotesChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <NotesContainer>
      <NotesHeader>
        <NotesTitle>Notes</NotesTitle>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </NotesHeader>
      
      {isExpanded && (
        <NotesTextarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Take notes here to help solve the puzzle..."
        />
      )}
    </NotesContainer>
  );
};

export default NotesPanel; 