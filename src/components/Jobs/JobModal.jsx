// src/components/Jobs/JobModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Tag, Plus } from 'lucide-react';
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
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, ...updates }) => api.updateJob(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      onSave();
    }
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        status: job.status,
        tags: job.tags || []
      });
    }
  }, [job]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title.length > 100) {
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
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isLoading = createJobMutation.isLoading || updateJobMutation.isLoading;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{job ? 'Edit Job' : 'Create Job'}</h2>
          <button onClick={onClose} className="close-button">
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
              placeholder="Enter job title"
              error={errors.title}
              disabled={isLoading}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <Select
              value={formData.status}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' }
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
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  icon={Tag}
                  disabled={isLoading}
                />
                <Button type="button" onClick={addTag} variant="outline" disabled={isLoading}>
                  <Plus size={16} />
                </Button>
              </div>
              
              <div className="tags-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};