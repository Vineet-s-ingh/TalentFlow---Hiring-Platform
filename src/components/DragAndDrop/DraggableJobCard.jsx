// src/components/Jobs/JobModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { api } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const JobModal = ({ job, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'active',
    tags: []
  });
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: (jobData) => api.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      onSave();
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, ...updates }) => api.updateJob(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      onSave();
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    }
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        status: job.status || 'active',
        tags: job.tags || []
      });
    } else {
      setFormData({
        title: '',
        status: 'active',
        tags: []
      });
    }
    setErrors({});
    setNewTag('');
  }, [job]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (job) {
      updateJobMutation.mutate({
        id: job.id,
        ...formData
      });
    } else {
      createJobMutation.mutate(formData);
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      if (formData.tags.length >= 10) {
        setErrors({ tags: 'Maximum 10 tags allowed' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
      setErrors(prev => ({ ...prev, tags: undefined }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const isLoading = createJobMutation.isLoading || updateJobMutation.isLoading;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{job ? 'Edit Job' : 'Create New Job'}</h2>
          <button onClick={onClose} className="close-button" disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Senior Frontend Developer"
              error={errors.title}
              disabled={isLoading}
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              {formData.title.length}/100 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <Select
              id="status"
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              options={[
                { value: 'active', label: '🟢 Active' },
                { value: 'archived', label: '🔴 Archived' }
              ]}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-container">
              <div className="tags-input">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag (e.g., React, JavaScript)"
                  icon={Tag}
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  variant="outline" 
                  disabled={isLoading || !newTag.trim()}
                  icon={Plus}
                >
                  Add
                </Button>
              </div>
              
              {errors.tags && <span className="error-text">{errors.tags}</span>}
              
              <div className="tags-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      disabled={isLoading}
                      aria-label={`Remove ${tag} tag`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
                {formData.tags.length === 0 && (
                  <span style={{ 
                    color: 'var(--text-lighter)', 
                    fontSize: '0.875rem',
                    fontStyle: 'italic'
                  }}>
                    No tags added yet
                  </span>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="error-text" style={{ marginBottom: '1rem' }}>
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid transparent', 
                    borderTop: '2px solid currentColor', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                  {job ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                job ? 'Update Job' : 'Create Job'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};