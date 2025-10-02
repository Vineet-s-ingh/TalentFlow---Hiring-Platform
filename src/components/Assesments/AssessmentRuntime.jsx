// src/components/Assessments/AssessmentRuntime.jsx
import React, { useState } from 'react';
import { Button } from '../UI/Button';

export const AssessmentRuntime = ({ assessment, onSubmit }) => {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateResponses = () => {
    const newErrors = {};
    
    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required && !responses[question.id]) {
          newErrors[question.id] = 'This question is required';
        }
        
        // Check conditional logic
        if (question.conditional) {
          const { dependsOn, condition, value } = question.conditional;
          const dependentResponse = responses[dependsOn];
          
          if (condition === 'equals' && dependentResponse === value) {
            if (question.required && !responses[question.id]) {
              newErrors[question.id] = 'This question is required';
            }
          }
        }
        
        // Validate numeric range
        if (question.type === 'numeric' && question.validation) {
          const numericValue = parseFloat(responses[question.id]);
          if (!isNaN(numericValue)) {
            if (question.validation.min !== undefined && numericValue < question.validation.min) {
              newErrors[question.id] = `Value must be at least ${question.validation.min}`;
            }
            if (question.validation.max !== undefined && numericValue > question.validation.max) {
              newErrors[question.id] = `Value must be at most ${question.validation.max}`;
            }
          }
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateResponses()) {
      onSubmit(responses);
    }
  };

  const shouldShowQuestion = (question) => {
    if (!question.conditional) return true;
    
    const { dependsOn, condition, value } = question.conditional;
    const dependentResponse = responses[dependsOn];
    
    switch (condition) {
      case 'equals':
        return dependentResponse === value;
      case 'notEquals':
        return dependentResponse !== value;
      case 'greaterThan':
        return parseFloat(dependentResponse) > parseFloat(value);
      default:
        return true;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="assessment-runtime">
      <h2>{assessment.title}</h2>
      
      {assessment.sections.map(section => (
        <div key={section.id} className="assessment-section">
          <h3>{section.title}</h3>
          
          {section.questions.map(question => (
            <div
              key={question.id}
              className={`question-container ${
                !shouldShowQuestion(question) ? 'hidden' : ''
              }`}
            >
              <QuestionRenderer
                question={question}
                value={responses[question.id]}
                onChange={(value) => handleResponseChange(question.id, value)}
                error={errors[question.id]}
              />
            </div>
          ))}
        </div>
      ))}
      
      <Button type="submit">Submit Assessment</Button>
    </form>
  );
};

const QuestionRenderer = ({ question, value, onChange, error }) => {
  const renderQuestion = () => {
    switch (question.type) {
      case 'single-choice':
        return (
          <div className="options-list">
            {question.options.map(option => (
              <label key={option} className="option-label">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'multi-choice':
        return (
          <div className="options-list">
            {question.options.map(option => (
              <label key={option} className="option-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={value?.includes(option) || false}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter(v => v !== option);
                    onChange(newValue);
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'short-text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            maxLength={question.validation?.maxLength}
            className="text-input"
          />
        );
      
      case 'long-text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            maxLength={question.validation?.maxLength}
            rows={4}
            className="text-area"
          />
        );
      
      case 'numeric':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            min={question.validation?.min}
            max={question.validation?.max}
            className="number-input"
          />
        );
      
      case 'file-upload':
        return (
          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => {
                // Stub implementation
                onChange(e.target.files[0]?.name);
              }}
            />
            <small>File upload functionality is stubbed</small>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="question">
      <label className="question-label">
        {question.question}
        {question.required && <span className="required">*</span>}
      </label>
      
      {renderQuestion()}
      
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};