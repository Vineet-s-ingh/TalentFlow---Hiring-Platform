// src/pages/JobsBoard.jsx
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Archive, Edit3, Eye, MoreHorizontal } from 'lucide-react';
import { DraggableJobCard } from '../components/Jobs/DraggableJobCard';
import { JobModal } from '../components/Jobs/JobModal';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { api } from '../services/api';
import { JOB_STATUS } from '../types';

export function JobsBoard() {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    pageSize: 12
  });

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.getJobs(filters),
    keepPreviousData: true
  });

  const queryClient = useQueryClient();

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleArchiveJob = async (job) => {
    try {
      await api.updateJob(job.id, {
        status: job.status === 'archived' ? 'active' : 'archived'
      });
      queryClient.invalidateQueries(['jobs']);
    } catch (error) {
      console.error('Failed to archive job:', error);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const moveJob = async (fromIndex, toIndex) => {
    try {
      // Convert array indices to order numbers (1-based)
      const fromOrder = fromIndex + 1;
      const toOrder = toIndex + 1;
      await api.reorderJobs(fromOrder, toOrder);
      queryClient.invalidateQueries(['jobs']);
    } catch (error) {
      console.error('Failed to reorder jobs:', error);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            borderRadius: '50%', 
            background: '#ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            !
          </div>
          <h3 style={{ margin: 0, color: '#dc2626' }}>Error loading jobs</h3>
        </div>
        <p style={{ margin: 0, color: '#991b1b' }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="jobs-board">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Jobs Board</h1>
          <p>Manage your job postings and applications</p>
        </div>
        <Button onClick={handleCreateJob} icon={Plus}>
          Create Job
        </Button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <Input
          icon={Search}
          placeholder="Search jobs by title or tags..."
          value={filters.search}
          onChange={(e) => handleFiltersChange({ search: e.target.value })}
          className="search-input"
        />
        
        <Select
          value={filters.status}
          onChange={(value) => handleFiltersChange({ status: value })}
          options={[
            { value: '', label: 'All Status' },
            { value: JOB_STATUS.active, label: 'Active' },
            { value: JOB_STATUS.archived, label: 'Archived' }
          ]}
        />
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-light)', fontSize: '0.875rem' }}>
          <Filter size={16} />
          <span>Filters</span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {isLoading ? (
          <div className="loading">Loading jobs...</div>
        ) : jobsData?.data?.length > 0 ? (
          jobsData.data.map((job, index) => (
            <DraggableJobCard
              key={job.id}
              job={job}
              index={index}
              onEdit={handleEditJob}
              onArchive={handleArchiveJob}
              moveCard={moveJob}
            />
          ))
        ) : (
          <div className="empty-state">
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'var(--background)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--text-lighter)'
            }}>
              <Briefcase size={32} />
            </div>
            <h3>No jobs found</h3>
            <p>Create your first job posting to get started.</p>
            <Button 
              onClick={handleCreateJob} 
              icon={Plus}
              style={{ marginTop: '1rem' }}
            >
              Create Your First Job
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {jobsData && jobsData.totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={jobsData.totalPages}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      )}

      {/* Job Modal */}
      {showModal && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setShowModal(false);
            setEditingJob(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingJob(null);
            queryClient.invalidateQueries(['jobs']);
          }}
        />
      )}
    </div>
  );
}

// Add the Briefcase import at the top
import { Briefcase } from 'lucide-react';