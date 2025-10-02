// src/components/Candidates/KanbanBoard.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
import { CandidateCard } from './CandidateCard';
import { STAGES } from '../../types';

export const KanbanBoard = ({ candidates, onCandidateMove, onCandidateClick }) => {
  return (
    <div className="kanban-board">
      {Object.entries(STAGES).map(([stageKey, stageLabel]) => (
        <KanbanColumn
          key={stageKey}
          stage={stageKey}
          label={stageLabel}
          candidates={candidates.filter(c => c.stage === stageKey)}
          onCandidateMove={onCandidateMove}
          onCandidateClick={onCandidateClick}
        />
      ))}
    </div>
  );
};

const KanbanColumn = ({ stage, label, candidates, onCandidateMove, onCandidateClick }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'candidate',
    drop: (item) => {
      if (item.stage !== stage) {
        onCandidateMove(item.id, stage);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const backgroundColor = isOver ? '#f0f9ff' : '#f8fafc';

  return (
    <div ref={drop} className="kanban-column" style={{ backgroundColor }}>
      <div className="column-header">
        <h3>{label}</h3>
        <span className="count">{candidates.length}</span>
      </div>
      
      <div className="candidates-list">
        {candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onClick={onCandidateClick}
          />
        ))}
      </div>
    </div>
  );
};