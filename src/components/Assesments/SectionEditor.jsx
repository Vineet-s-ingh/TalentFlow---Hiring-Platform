// src/components/Assessments/SectionEditor.jsx
import React from 'react';
import { Plus, GripVertical } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { QuestionEditor } from './QuestionEditor';

export function SectionEditor({ 
  section, 
  sectionIndex, 
  onUpdate, 
  onQuestionDragStart, 
  onQuestionDragOver, 
  onQuestionDrop 
}) {
  const updateSection = (updates) => {
    onUpdate({ ...section, ...updates });
  };

  const addQuestion = (type = 'short-text') => {
    const baseQuestion = {
      id: Date.now().toString(),
      type,
      question: '',
      description: '',
      required: false,
      validation: {}
    };

    const questionWithDefaults = {
      ...baseQuestion,
      ...getQuestionDefaults(type)
    };

    updateSection({
      ...section,
      questions: [...section.questions, questionWithDefaults]
    });
  };

  const getQuestionDefaults = (type) => {
    const defaults = {
      'single-choice': { options: ['Option 1', 'Option 2', 'Option 3'] },
      'multi-choice': { options: ['Option 1', 'Option 2', 'Option 3'] },
      'short-text': { maxLength: 100 },
      'long-text': { maxLength: 1000 },
      'numeric': { min: 0, max: 100 },
      'file-upload': { maxSize: 5 } // 5MB
    };
    return defaults[type] || {};
  };

  const updateQuestion = (questionIndex, updatedQuestion) => {
    const updatedQuestions = section.questions.map((question, index) =>
      index === questionIndex ? updatedQuestion : question
    );
    updateSection({ ...section, questions: updatedQuestions });
  };

  const deleteQuestion = (questionIndex) => {
    const updatedQuestions = section.questions.filter((_, index) => index !== questionIndex);
    updateSection({ ...section, questions: updatedQuestions });
  };

  const duplicateQuestion = (questionIndex) => {
    const questionToDuplicate = section.questions[questionIndex];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: Date.now().toString(),
      question: `${questionToDuplicate.question} (Copy)`
    };
    
    const updatedQuestions = [...section.questions];
    updatedQuestions.splice(questionIndex + 1, 0, duplicatedQuestion);
    updateSection({ ...section, questions: updatedQuestions });
  };

  return (
    <div className="section-editor">
      <div className="section-header">
        <Input
          value={section.title}
          onChange={(e) => updateSection({ title: e.target.value })}
          placeholder="Section Title"
          className="section-title-input"
        />
        <Input
          value={section.description}
          onChange={(e) => updateSection({ description: e.target.value })}
          placeholder="Section Description (optional)"
          className="section-description-input"
        />
      </div>

      <div className="questions-list">
        {section.questions.map((question, questionIndex) => (
          <div
            key={question.id}
            className="question-container"
            draggable
            onDragStart={(e) => {
              onQuestionDragStart(sectionIndex, questionIndex);
              e.dataTransfer.setData('text/plain', '');
            }}
            onDragOver={(e) => onQuestionDragOver(e, sectionIndex, questionIndex)}
            onDrop={(e) => onQuestionDrop(sectionIndex, questionIndex)}
          >
            <GripVertical className="question-drag-handle" size={16} />
            <QuestionEditor
              question={question}
              questionIndex={questionIndex}
              onUpdate={(updatedQuestion) => updateQuestion(questionIndex, updatedQuestion)}
              onDelete={() => deleteQuestion(questionIndex)}
              onDuplicate={() => duplicateQuestion(questionIndex)}
            />
          </div>
        ))}
      </div>

      <div className="question-actions">
        <div className="add-question-header">
          <h4>Add Question</h4>
        </div>
        <div className="question-type-buttons">
          <Button
            onClick={() => addQuestion('short-text')}
            variant="outline"
            size="sm"
          >
            Short Text
          </Button>
          <Button
            onClick={() => addQuestion('long-text')}
            variant="outline"
            size="sm"
          >
            Long Text
          </Button>
          <Button
            onClick={() => addQuestion('single-choice')}
            variant="outline"
            size="sm"
          >
            Single Choice
          </Button>
          <Button
            onClick={() => addQuestion('multi-choice')}
            variant="outline"
            size="sm"
          >
            Multiple Choice
          </Button>
          <Button
            onClick={() => addQuestion('numeric')}
            variant="outline"
            size="sm"
          >
            Numeric
          </Button>
          <Button
            onClick={() => addQuestion('file-upload')}
            variant="outline"
            size="sm"
          >
            File Upload
          </Button>
        </div>
      </div>
    </div>
  );
}