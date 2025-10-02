// src/types/index.js
export const STAGES = {
  applied: 'Applied',
  screen: 'Screen',
  tech: 'Technical',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected'
};

export const QUESTION_TYPES = {
  single: 'single-choice',
  multiple: 'multi-choice',
  short: 'short-text',
  long: 'long-text',
  numeric: 'numeric',
  file: 'file-upload'
};

export const JOB_STATUS = {
  active: 'active',
  archived: 'archived'
};

// Job type definition
export const JobType = {
  id: String,
  title: String,
  slug: String,
  status: JOB_STATUS.active | JOB_STATUS.archived,
  tags: Array,
  order: Number,
  createdAt: Date,
  updatedAt: Date
};