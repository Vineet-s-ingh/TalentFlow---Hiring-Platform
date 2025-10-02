// src/pages/Assessments.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Eye, Trash2, GripVertical, FileText } from 'lucide-react';
import { AssessmentBuilder } from '../components/Assesments/AssesmentsBuilder';
import { AssessmentPreview } from '../components/Assesments/AssessmentPreview';
import { Button } from '../components/UI/Button';
import { Select } from '../components/UI/Select';
import { api } from '../services/api';
import { db } from '../services/database';

export function Assessments() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [mode, setMode] = useState('builder'); // 'builder' | 'preview'
  const [assessment, setAssessment] = useState(null);

  // Fetch jobs for the dropdown
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs({ status: 'active', pageSize: 100 })
  });

  // Fetch assessment for the selected job
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['assessment', selectedJobId],
    queryFn: () => api.getAssessment(selectedJobId),
    enabled: !!selectedJobId
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: (assessmentData) => api.saveAssessment(assessmentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['assessment', selectedJobId]);
      alert('Assessment saved successfully!');
    },
    onError: (error) => {
      alert(`Failed to save assessment: ${error.message}`);
    }
  });

  useEffect(() => {
    if (assessmentData) {
      setAssessment(assessmentData);
    } else if (selectedJobId) {
      // Create a new assessment structure
      const job = jobsData?.data?.find(j => j.id == selectedJobId);
      setAssessment({
        jobId: parseInt(selectedJobId),
        title: job ? `${job.title} Assessment` : 'New Assessment',
        sections: [
          {
            id: Date.now().toString(),
            title: 'General Questions',
            questions: []
          }
        ]
      });
    }
  }, [assessmentData, selectedJobId, jobsData]);

  const handleSave = () => {
    if (!assessment) return;
    saveAssessmentMutation.mutate(assessment);
  };

  const handleAssessmentChange = (updatedAssessment) => {
    setAssessment(updatedAssessment);
  };

  if (!selectedJobId) {
    return (
      <div className="assessments-page">
        <div className="page-header">
          <div className="page-header-content">
            <h1>Assessments</h1>
            <p>Create and manage job-specific assessments</p>
          </div>
        </div>

        <div className="assessment-selection">
          <div className="selection-card">
            <FileText size={48} className="selection-icon" />
            <h2>Select a Job</h2>
            <p>Choose a job to create or edit its assessment</p>
            
            <div className="job-selector">
              <Select
                value={selectedJobId}
                onChange={setSelectedJobId}
                options={[
                  { value: '', label: 'Select a job...' },
                  ...(jobsData?.data?.map(job => ({
                    value: job.id.toString(),
                    label: job.title
                  })) || [])
                ]}
                className="job-select"
              />
            </div>

            {jobsData?.data?.length === 0 && (
              <div className="empty-jobs">
                <p>No active jobs found. Create a job first to build assessments.</p>
                <Button 
                  onClick={() => window.location.href = '/jobs'}
                  icon={Plus}
                >
                  Create Job
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessments-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Assessment Builder</h1>
          <p>Create assessment for {jobsData?.data?.find(j => j.id == selectedJobId)?.title}</p>
        </div>
        
        <div className="page-actions">
          <Select
            value={selectedJobId}
            onChange={setSelectedJobId}
            options={[
              { value: '', label: 'Change Job...' },
              ...(jobsData?.data?.map(job => ({
                value: job.id.toString(),
                label: job.title
              })) || [])
            ]}
            className="job-switcher"
          />
          
          <Button
            variant="outline"
            icon={Eye}
            onClick={() => setMode(mode === 'builder' ? 'preview' : 'builder')}
          >
            {mode === 'builder' ? 'Preview' : 'Back to Builder'}
          </Button>
          
          <Button
            icon={Save}
            onClick={handleSave}
            disabled={saveAssessmentMutation.isLoading}
          >
            {saveAssessmentMutation.isLoading ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading assessment...</div>
      ) : assessment ? (
        mode === 'builder' ? (
          <AssessmentBuilder
            assessment={assessment}
            onChange={handleAssessmentChange}
          />
        ) : (
          <AssessmentPreview
            assessment={assessment}
            onBack={() => setMode('builder')}
          />
        )
      ) : (
        <div className="loading">Creating new assessment...</div>
      )}
    </div>
  );
}