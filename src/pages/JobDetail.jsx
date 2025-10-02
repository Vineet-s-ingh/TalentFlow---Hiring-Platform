// src/pages/JobDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit3, Users, Calendar } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { api } from '../services/api';

export function JobDetail() {
  const { jobId } = useParams();
  
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.getJobs().then(res => 
      res.data.find(j => j.id == jobId)
    )
  });

  if (isLoading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="error-container">
        <h2>Job not found</h2>
        <p>The job you're looking for doesn't exist.</p>
        <Link to="/jobs" className="btn btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/jobs" className="back-link">
            <ArrowLeft size={20} />
            Back to Jobs
          </Link>
          <h1>{job.title}</h1>
          <p>Job details and management</p>
        </div>
        <div className="page-actions">
          <Button icon={Edit3} variant="outline">
            Edit Job
          </Button>
          <Button icon={Users}>
            View Candidates
          </Button>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-info-grid">
          <div className="info-card">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${job.status}`}>
                  {job.status}
                </span>
              </div>
              <div className="info-item">
                <label>Created</label>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Order</label>
                <span>{job.order}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>Tags & Skills</h3>
            <div className="job-tags">
              {job.tags?.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="info-card full-width">
            <h3>Candidates by Stage</h3>
            <div className="stages-overview">
              <div className="stage-item">
                <span className="stage-name">Applied</span>
                <span className="stage-count">24</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Screen</span>
                <span className="stage-count">12</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Technical</span>
                <span className="stage-count">8</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Offer</span>
                <span className="stage-count">3</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Hired</span>
                <span className="stage-count">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}