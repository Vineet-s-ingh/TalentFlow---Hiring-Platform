// src/hooks/useJobs.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useJobs(filters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.getJobs(filters),
    keepPreviousData: true
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobData) => api.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
    }
  });
}

// Similar hooks for candidates, assessments, etc.