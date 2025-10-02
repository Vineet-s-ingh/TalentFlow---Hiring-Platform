// src/pages/CandidateProfile.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Edit, Send } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Select } from '../components/UI/Select';
import { Input } from '../components/UI/Input';
import { MentionsTextarea } from '../components/Notes/MentionsTextarea';
import { api } from '../services/api';
import { STAGES } from '../types';

export function CandidateProfile() {
  const { candidateId } = useParams();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => api.getCandidates().then(res => 
      res.data.find(c => c.id == candidateId)
    )
  });

  const updateStageMutation = useMutation({
    mutationFn: (stage) => api.updateCandidateStage(candidateId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate', candidateId]);
      queryClient.invalidateQueries(['candidates']);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: () => api.addCandidateNote(candidateId, newNote),
    onSuccess: () => {
      setNewNote('');
      queryClient.invalidateQueries(['candidate', candidateId]);
    }
  });

  if (isLoading) return <div className="loading">Loading candidate...</div>;
  if (!candidate) return <div className="error">Candidate not found</div>;

  return (
    <div className="candidate-profile">
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/candidates" className="back-link">
            <ArrowLeft size={20} />
            Back to Candidates
          </Link>
          <h1>{candidate.name}</h1>
          <p>Candidate profile and application details</p>
        </div>
        
        <div className="page-actions">
          <Select
            value={candidate.stage}
            onChange={(stage) => updateStageMutation.mutate(stage)}
            options={Object.entries(STAGES).map(([value, label]) => ({ value, label }))}
          />
          <Button icon={Edit} variant="outline">
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="candidate-profile-content">
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="candidate-avatar large">
              <div className="avatar-placeholder">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <h2>{candidate.name}</h2>
            <p className="candidate-email">{candidate.email}</p>
            
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>San Francisco, CA</span>
              </div>
              <div className="contact-item">
                <Calendar size={16} />
                <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="notes-section">
            <h3>Add Note</h3>
            <MentionsTextarea
              value={newNote}
              onChange={setNewNote}
              placeholder="Add a note about this candidate... Use @ to mention colleagues"
            />
            <Button 
              onClick={() => addNoteMutation.mutate()}
              disabled={!newNote.trim() || addNoteMutation.isLoading}
              icon={Send}
            >
              {addNoteMutation.isLoading ? 'Adding...' : 'Add Note'}
            </Button>

            <div className="existing-notes">
              <h4>Previous Notes</h4>
              {candidate.notes?.map(note => (
                <div key={note.id} className="note">
                  <div className="note-content">{note.note}</div>
                  <div className="note-meta">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {(!candidate.notes || candidate.notes.length === 0) && (
                <p className="no-notes">No notes yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="timeline-section">
            <h3>Application Timeline</h3>
            <CandidateTimeline candidateId={candidateId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateTimeline({ candidateId }) {
  const { data: timeline } = useQuery({
    queryKey: ['timeline', candidateId],
    queryFn: async () => {
      // This would come from API in real implementation
      return [
        {
          id: 1,
          stage: 'applied',
          note: 'Applied through website',
          createdAt: new Date('2024-01-15'),
          userId: 'system'
        },
        {
          id: 2,
          stage: 'screen',
          note: 'Passed initial screening',
          createdAt: new Date('2024-01-18'),
          userId: 'hr-user'
        },
        {
          id: 3,
          stage: 'tech',
          note: 'Technical assessment completed',
          createdAt: new Date('2024-01-22'),
          userId: 'tech-user'
        }
      ];
    }
  });

  if (!timeline) return <div>Loading timeline...</div>;

  return (
    <div className="timeline">
      {timeline.map((event, index) => (
        <div key={event.id} className="timeline-item">
          <div className="timeline-marker" />
          <div className="timeline-content">
            <div className="timeline-title">
              Stage changed to <strong>{STAGES[event.stage]}</strong>
            </div>
            <div className="timeline-date">
              {new Date(event.createdAt).toLocaleString()}
            </div>
            {event.note && (
              <div className="timeline-note">{event.note}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}