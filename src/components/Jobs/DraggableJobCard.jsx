// src/components/Jobs/DraggableJobCard.jsx
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Archive, Edit3, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DraggableJobCard = ({ job, index, onEdit, onArchive, moveCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'job',
    item: { id: job.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'job',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity }} className="job-card">
      <div className="job-card-header">
        <GripVertical className="drag-handle" />
        <div className="job-actions">
          <Link to={`/jobs/${job.id}`} title="View">
            <Eye size={16} />
          </Link>
          <button onClick={() => onEdit(job)} title="Edit">
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => onArchive(job)} 
            title={job.status === 'archived' ? 'Unarchive' : 'Archive'}
          >
            <Archive size={16} />
          </button>
        </div>
      </div>
      
      <h3>{job.title}</h3>
      <div className="job-tags">
        {job.tags?.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="job-footer">
        <span className={`status-badge ${job.status}`}>
          {job.status === 'active' ? 'Active' : 'Archived'}
        </span>
        <span className="order">Order: {job.order}</span>
      </div>
    </div>
  );
};