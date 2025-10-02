// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function Dashboard() {
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs({ status: 'active', pageSize: 5 })
  });

  const { data: candidatesData } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates({ pageSize: 5 })
  });

  const stats = [
    {
      title: 'Active Jobs',
      value: jobsData?.total?.toString() || '0',
      icon: Briefcase,
      color: 'blue',
      link: '/jobs'
    },
    {
      title: 'Total Candidates',
      value: candidatesData?.total?.toString() || '0',
      icon: Users,
      color: 'green',
      link: '/candidates'
    },
    {
      title: 'Assessments',
      value: '3', // This would come from API in a real app
      icon: FileText,
      color: 'purple',
      link: '/assessments'
    },
    {
      title: 'Hiring Rate',
      value: '24%',
      icon: TrendingUp,
      color: 'orange',
      link: '/candidates?stage=hired'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      icon: Users,
      title: 'New candidate applied',
      description: 'Carol Davis applied for Senior Frontend Developer',
      time: '2 hours ago',
      color: 'blue'
    },
    {
      id: 2,
      icon: Briefcase,
      title: 'Job created',
      description: 'New job "Backend Engineer" was created',
      time: '5 hours ago',
      color: 'green'
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Stage updated',
      description: 'Henry Taylor moved to Technical stage',
      time: '1 day ago',
      color: 'purple'
    },
    {
      id: 4,
      icon: FileText,
      title: 'Assessment completed',
      description: 'Alice Johnson completed the technical assessment',
      time: '2 days ago',
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Dashboard</h1>
          <p>Welcome to TalentFlow Hiring Platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link} className="stat-card">
              <div className="stat-icon" data-color={stat.color}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
              <ArrowRight size={16} className="stat-arrow" />
            </Link>
          );
        })}
      </div>

      <div className="dashboard-grid">
        {/* Recent Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Jobs</h2>
            <Link to="/jobs" className="view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="jobs-list">
            {jobsData?.data?.map(job => (
              <div key={job.id} className="job-item">
                <div className="job-info">
                  <h4>{job.title}</h4>
                  <div className="job-tags">
                    {job.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="tag sm">{tag}</span>
                    ))}
                    {job.tags && job.tags.length > 2 && (
                      <span className="tag sm">+{job.tags.length - 2}</span>
                    )}
                  </div>
                </div>
                <div className="job-status">
                  <span className={`status-badge ${job.status}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
            {(!jobsData?.data || jobsData.data.length === 0) && (
              <div className="empty-state sm">
                <p>No active jobs</p>
                <Link to="/jobs" className="btn btn-outline btn-sm">
                  Create Job
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Candidates</h2>
            <Link to="/candidates" className="view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="candidates-list">
            {candidatesData?.data?.map(candidate => (
              <div key={candidate.id} className="candidate-item">
                <div className="candidate-avatar">
                  <Users size={16} />
                </div>
                <div className="candidate-info">
                  <h4>{candidate.name}</h4>
                  <p>{candidate.email}</p>
                </div>
                <div className="candidate-stage">
                  <span className={`stage-badge sm ${candidate.stage}`}>
                    {candidate.stage}
                  </span>
                </div>
              </div>
            ))}
            {(!candidatesData?.data || candidatesData.data.length === 0) && (
              <div className="empty-state sm">
                <p>No candidates</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {recentActivities.map(activity => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" data-color={activity.color}>
                    <Icon size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}