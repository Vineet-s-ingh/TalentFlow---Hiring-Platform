// src/services/database.js
import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    
    this.version(2).stores({
      jobs: '++id, title, slug, status, tags, order, createdAt, updatedAt',
      candidates: '++id, name, email, stage, jobId, appliedAt, notes',
      assessments: 'id, jobId, title, sections, createdAt',
      assessmentResponses: '++id, assessmentId, candidateId, responses, submittedAt',
      candidateTimeline: '++id, candidateId, stage, note, createdAt, userId'
    });
    
    this.jobs = this.table('jobs');
    this.candidates = this.table('candidates');
    this.assessments = this.table('assessments');
  }

  async seedInitialData() {
    const jobsCount = await this.jobs.count();
    const candidatesCount = await this.candidates.count();
    
    if (jobsCount === 0) {
      await this.seedJobs();
    }
    
    if (candidatesCount === 0) {
      await this.seedCandidates();
    }
    
    if ((await this.assessments.count()) === 0) {
      await this.seedAssessments();
    }
  }

  async seedJobs() {
    const jobs = [
      {
        id: 1,
        title: "Senior Frontend Developer",
        slug: "senior-frontend-developer",
        status: "active",
        tags: ["React", "TypeScript", "JavaScript"],
        order: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        title: "Backend Engineer",
        slug: "backend-engineer",
        status: "active",
        tags: ["Node.js", "Python", "API"],
        order: 2,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      // Add 23 more jobs with mixed active/archived status
    ];

    await this.jobs.bulkAdd(jobs);
  }

  async seedCandidates() {
    const candidates = [];
    const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const names = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown',
      'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Moore'
    ];
    
    for (let i = 1; i <= 1000; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)] + ` ${i}`;
      const randomStage = stages[Math.floor(Math.random() * stages.length)];
      const randomJobId = Math.floor(Math.random() * 25) + 1;
      
      candidates.push({
        id: i,
        name: randomName,
        email: `candidate${i}@email.com`,
        stage: randomStage,
        jobId: randomJobId,
        appliedAt: new Date(Date.now() - Math.random() * 10000000000),
        notes: []
      });
    }
    
    await this.candidates.bulkAdd(candidates);
  }

  async seedAssessments() {
    const assessments = [
      {
        id: 1,
        jobId: 1,
        title: "Frontend Development Assessment",
        sections: [
          {
            id: 1,
            title: "JavaScript Fundamentals",
            questions: [
              {
                id: 1,
                type: "single-choice",
                question: "What is the output of: console.log(typeof null)?",
                options: ["object", "null", "undefined", "string"],
                required: true,
                validation: {}
              },
              {
                id: 2,
                type: "multi-choice",
                question: "Which of the following are JavaScript frameworks?",
                options: ["React", "Angular", "Vue", "Django"],
                required: true,
                validation: {}
              }
            ]
          }
        ],
        createdAt: new Date()
      }
    ];
    
    await this.assessments.bulkAdd(assessments);
  }
}

export const db = new TalentFlowDB();