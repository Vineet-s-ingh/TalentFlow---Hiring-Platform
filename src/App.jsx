// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { JobsBoard } from './pages/JobBoard';
import { JobDetail } from './pages/JobDetail';
import { Candidates } from './pages/Candidates';
// Removed duplicate import of JobsBoard
import { CandidateProfile } from './pages/CandidateProfile';
import { Assessments } from './pages/Assessments';
import { useSeedData } from './hooks/useSeedData';
import './styles/global.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  useSeedData();

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="app">
          <Header />
          <div className="app-content">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<JobsBoard />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/candidates/:candidateId" element={<CandidateProfile />} />
                <Route path="/assessments" element={<Assessments />} />
                <Route path="/assessments/:jobId" element={<Assessments />} />
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </DndProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// 404 Not Found component
function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary">
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export default App;