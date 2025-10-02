// src/pages/Candidates.jsx
import React, { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Search, User, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { api } from '../services/api';
import { STAGES } from '../types';

export function Candidates() {
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    page: 1
  });

  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => api.getCandidates(filters)
  });

  const filteredCandidates = useMemo(() => {
    return candidatesData?.data || [];
  }, [candidatesData]);

  const CandidateRow = ({ index, style }) => {
    const candidate = filteredCandidates[index];
    if (!candidate) return null;

    return (
      <div style={style} className="candidate-row">
        <div className="candidate-info">
          <div className="candidate-avatar">
            <User size={20} />
          </div>
          <div className="candidate-details">
            <Link to={`/candidates/${candidate.id}`} className="candidate-name">
              {candidate.name}
            </Link>
            <p className="candidate-email">{candidate.email}</p>
          </div>
        </div>
        <div className="candidate-stage">
          <span className={`stage-badge ${candidate.stage}`}>
            {STAGES[candidate.stage]}
          </span>
        </div>
        <div className="candidate-job">
          Job #{candidate.jobId}
        </div>
      </div>
    );
  };

  return (
    <div className="candidates-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Candidates</h1>
          <p>Manage candidate applications and progression</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h2>Search Candidates</h2>
          <div className="filters-summary">
            <Filter size={16} />
            <span>Filters</span>
          </div>
        </div>
        
        <div className="filters-bar">
          <Input
            icon={Search}
            placeholder="Search candidates by name or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
          
          <Select
            value={filters.stage}
            onChange={(stage) => setFilters(prev => ({ ...prev, stage }))}
            options={[
              { value: '', label: 'All Stages' },
              ...Object.entries(STAGES).map(([value, label]) => ({ value, label }))
            ]}
            className="stage-select"
          />
        </div>
      </div>

      {/* Candidates List */}
      <div className="candidates-container">
        <div className="candidates-header">
          <div className="candidates-count">
            {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'} found
          </div>
          <div className="candidates-actions">
            <button className="sort-button">
              Sort by <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="candidates-list-container">
          {isLoading ? (
            <div className="loading">Loading candidates...</div>
          ) : filteredCandidates.length > 0 ? (
            <List
              height={600}
              itemCount={filteredCandidates.length}
              itemSize={72}
              width="100%"
              className="virtualized-list"
            >
              {CandidateRow}
          </List>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <User size={48} />
              </div>
              <h3>No candidates found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}