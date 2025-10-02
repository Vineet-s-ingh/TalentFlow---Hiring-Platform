// src/components/Assessments/AssessmentBuilder.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Eye, GripVertical, Copy, Settings } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { QuestionEditor } from './QuestionEditor';
import { SectionEditor } from './SectionEditor';

export function AssessmentBuilder({ assessment, onChange }) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [draggedQuestion, setDraggedQuestion] = useState(null);

  const updateAssessment = (updates) => {
    onChange({ ...assessment, ...updates });
  };

  const updateSections = (sections) => {
    updateAssessment({ sections });
  };

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: `Section ${assessment.sections.length + 1}`,
      description: '',
      questions: []
    };
    
    updateSections([...assessment.sections, newSection]);
    setActiveSectionIndex(assessment.sections.length);
  };

  const deleteSection = (sectionIndex) => {
    if (assessment.sections.length <= 1) {
      alert('Assessment must have at least one section');
      return;
    }
    
    const updatedSections = assessment.sections.filter((_, index) => index !== sectionIndex);
    updateSections(updatedSections);
    
    if (activeSectionIndex >= sectionIndex) {
      setActiveSectionIndex(Math.max(0, activeSectionIndex - 1));
    }
  };

  const duplicateSection = (sectionIndex) => {
    const sectionToDuplicate = assessment.sections[sectionIndex];
    const duplicatedSection = {
      ...sectionToDuplicate,
      id: Date.now().toString(),
      title: `${sectionToDuplicate.title} (Copy)`,
      questions: sectionToDuplicate.questions.map(q => ({
        ...q,
        id: Date.now().toString() + Math.random()
      }))
    };
    
    const newSections = [...assessment.sections];
    newSections.splice(sectionIndex + 1, 0, duplicatedSection);
    updateSections(newSections);
    setActiveSectionIndex(sectionIndex + 1);
  };

  const moveSection = (fromIndex, toIndex) => {
    const sections = [...assessment.sections];
    const [movedSection] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, movedSection);
    updateSections(sections);
    setActiveSectionIndex(toIndex);
  };

  const handleQuestionDragStart = (sectionIndex, questionIndex) => {
    setDraggedQuestion({ sectionIndex, questionIndex });
  };

  const handleQuestionDragOver = (e, targetSectionIndex, targetQuestionIndex) => {
    e.preventDefault();
  };

  const handleQuestionDrop = (targetSectionIndex, targetQuestionIndex) => {
    if (!draggedQuestion) return;

    const { sectionIndex: sourceSectionIndex, questionIndex: sourceQuestionIndex } = draggedQuestion;
    
    if (sourceSectionIndex === targetSectionIndex && sourceQuestionIndex === targetQuestionIndex) {
      return;
    }

    const sections = [...assessment.sections];
    const sourceSection = sections[sourceSectionIndex];
    const question = sourceSection.questions[sourceQuestionIndex];

    // Remove from source
    sourceSection.questions.splice(sourceQuestionIndex, 1);
    
    // Add to target
    if (sourceSectionIndex === targetSectionIndex) {
      // Same section, adjust target index if needed
      const adjustedIndex = sourceQuestionIndex < targetQuestionIndex 
        ? targetQuestionIndex - 1 
        : targetQuestionIndex;
      sourceSection.questions.splice(adjustedIndex, 0, question);
    } else {
      // Different section
      const targetSection = sections[targetSectionIndex];
      targetSection.questions.splice(targetQuestionIndex, 0, question);
    }

    updateSections(sections);
    setDraggedQuestion(null);
  };

  const activeSection = assessment.sections[activeSectionIndex];

  return (
    <div className="assessment-builder">
      <div className="builder-header">
        <div className="assessment-title">
          <Input
            value={assessment.title}
            onChange={(e) => updateAssessment({ title: e.target.value })}
            placeholder="Assessment Title"
            className="title-input"
          />
        </div>
        
        <div className="builder-stats">
          <span>{assessment.sections.length} sections</span>
          <span>•</span>
          <span>{assessment.sections.reduce((total, section) => total + section.questions.length, 0)} questions</span>
        </div>
      </div>

      <div className="builder-content">
        {/* Sections Sidebar */}
        <div className="sections-sidebar">
          <div className="sidebar-header">
            <h3>Sections</h3>
            <Button onClick={addSection} icon={Plus} variant="ghost" size="sm">
              Add Section
            </Button>
          </div>
          
          <div className="sections-list">
            {assessment.sections.map((section, index) => (
              <div
                key={section.id}
                className={`section-tab ${index === activeSectionIndex ? 'active' : ''}`}
                onClick={() => setActiveSectionIndex(index)}
              >
                <GripVertical className="drag-handle" size={16} />
                <div className="section-tab-content">
                  <div className="section-title">{section.title || `Section ${index + 1}`}</div>
                  <div className="section-meta">
                    {section.questions.length} questions
                  </div>
                </div>
                <div className="section-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSection(index);
                    }}
                    title="Duplicate section"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(index);
                    }}
                    title="Delete section"
                    disabled={assessment.sections.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="main-editor">
          {activeSection && (
            <SectionEditor
              section={activeSection}
              sectionIndex={activeSectionIndex}
              onUpdate={(updatedSection) => {
                const updatedSections = assessment.sections.map((section, index) =>
                  index === activeSectionIndex ? updatedSection : section
                );
                updateSections(updatedSections);
              }}
              onQuestionDragStart={handleQuestionDragStart}
              onQuestionDragOver={handleQuestionDragOver}
              onQuestionDrop={handleQuestionDrop}
            />
          )}
        </div>
      </div>
    </div>
  );
}