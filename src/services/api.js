// src/services/api.js
import { db } from './database';

const simulateDelay = () => new Promise(resolve => 
  setTimeout(resolve, 200 + Math.random() * 1000)
);

const simulateError = () => Math.random() < 0.05; // 5% error rate

const handleError = (endpoint) => {
  if (simulateError()) {
    throw new Error(`Simulated error for ${endpoint}`);
  }
};

export const api = {
  // Jobs API
  async getJobs(filters = {}) {
    await simulateDelay();
    handleError('GET /jobs');
    
    let jobs = await db.jobs.toArray();
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.status) {
      jobs = jobs.filter(job => job.status === filters.status);
    }
    
    // Sort by order
    jobs.sort((a, b) => a.order - b.order);
    
    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedJobs,
      total: jobs.length,
      page,
      pageSize,
      totalPages: Math.ceil(jobs.length / pageSize)
    };
  },

  async createJob(jobData) {
    await simulateDelay();
    handleError('POST /jobs');
    
    const slug = jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingJob = await db.jobs.where('slug').equals(slug).first();
    
    if (existingJob) {
      throw new Error('Job with this title already exists');
    }
    
    const maxOrder = await db.jobs.orderBy('order').last();
    
    const job = {
      ...jobData,
      slug,
      order: (maxOrder?.order || 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const id = await db.jobs.add(job);
    return { id, ...job };
  },

  async updateJob(id, updates) {
    await simulateDelay();
    handleError('PATCH /jobs/:id');
    
    await db.jobs.update(id, {
      ...updates,
      updatedAt: new Date()
    });
    
    return { success: true };
  },

  async reorderJobs(fromOrder, toOrder) {
    await simulateDelay();
    handleError('PATCH /jobs/reorder');
    
    // Implement complex reordering logic
    const jobs = await db.jobs.toArray();
    const jobToMove = jobs.find(job => job.order === fromOrder);
    
    if (!jobToMove) {
      throw new Error('Job not found');
    }
    
    await db.transaction('rw', db.jobs, async () => {
      if (fromOrder < toOrder) {
        // Moving down
        for (const job of jobs) {
          if (job.order > fromOrder && job.order <= toOrder) {
            await db.jobs.update(job.id, { order: job.order - 1 });
          }
        }
      } else {
        // Moving up
        for (const job of jobs) {
          if (job.order < fromOrder && job.order >= toOrder) {
            await db.jobs.update(job.id, { order: job.order + 1 });
          }
        }
      }
      
      await db.jobs.update(jobToMove.id, { order: toOrder });
    });
    
    return { success: true };
  },

  // Candidates API
  async getCandidates(filters = {}) {
    await simulateDelay();
    
    let candidates = await db.candidates.toArray();
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.stage) {
      candidates = candidates.filter(candidate => candidate.stage === filters.stage);
    }
    
    if (filters.jobId) {
      candidates = candidates.filter(candidate => candidate.jobId == filters.jobId);
    }
    
    const page = filters.page || 1;
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedCandidates,
      total: candidates.length,
      page,
      pageSize
    };
  },

  async updateCandidateStage(id, stage) {
    await simulateDelay();
    handleError('PATCH /candidates/:id');
    
    await db.candidates.update(id, { stage });
    
    // Add to timeline
    await db.candidateTimeline.add({
      candidateId: id,
      stage,
      note: `Stage changed to ${stage}`,
      createdAt: new Date(),
      userId: 'system'
    });
    
    return { success: true };
  },

  async addCandidateNote(id, note) {
    const candidate = await db.candidates.get(id);
    const updatedNotes = [...(candidate.notes || []), {
      id: Date.now(),
      note,
      createdAt: new Date(),
      userId: 'current-user'
    }];
    
    await db.candidates.update(id, { notes: updatedNotes });
    return { success: true };
  },

  // Assessments API
  async getAssessment(jobId) {
    await simulateDelay();
    return await db.assessments.where('jobId').equals(parseInt(jobId)).first();
  },

  async saveAssessment(assessment) {
    await simulateDelay();
    handleError('PUT /assessments/:jobId');
    
    const existing = await db.assessments.where('jobId').equals(assessment.jobId).first();
    
    if (existing) {
      await db.assessments.update(existing.id, assessment);
    } else {
      await db.assessments.add({
        ...assessment,
        id: Date.now(),
        createdAt: new Date()
      });
    }
    
    return { success: true };
  }
};