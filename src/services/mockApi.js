// src/services/mockApi.js
import { http, HttpResponse } from 'msw';
import { db } from './database';

// Artificial delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Error simulation helper
const shouldError = () => Math.random() < 0.1; // 10% error rate

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    let jobs = await db.jobs.toArray();
    
    // Filtering
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);
    
    return HttpResponse.json({
      data: paginatedJobs,
      total: jobs.length,
      page,
      pageSize,
      totalPages: Math.ceil(jobs.length / pageSize)
    });
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(300);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const job = await request.json();
    const id = await db.jobs.add({
      ...job,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return HttpResponse.json({ id, ...job });
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await delay(300);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    const updates = await request.json();
    await db.jobs.update(parseInt(params.id), {
      ...updates,
      updatedAt: new Date()
    });
    
    return HttpResponse.json({ success: true });
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay(200);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Reorder failed' }, { status: 500 });
    }

    const { fromOrder, toOrder } = await request.json();
    // Implement reorder logic
    return HttpResponse.json({ success: true });
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 20;
    
    let candidates = await db.candidates.toArray();
    
    if (search) {
      candidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (stage) {
      candidates = candidates.filter(candidate => candidate.stage === stage);
    }
    
    const startIndex = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);
    
    return HttpResponse.json({
      data: paginatedCandidates,
      total: candidates.length,
      page,
      pageSize
    });
  }),

  // Add other endpoints similarly...
];