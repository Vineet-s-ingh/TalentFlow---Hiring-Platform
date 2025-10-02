// src/components/Assessments/AssessmentPreview.jsx
import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '../UI/Button';

export function AssessmentPreview({ assessment, onBack }) {
  const [responses, setResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'short-text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Your answer..."
            className="preview-input"
            maxLength={question.validation?.maxLength}
          />
        );

      case 'long-text':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Your answer..."
            className="preview-textarea"
            rows={4}
            maxLength={question.validation?.maxLength}
          />
        );

      case 'single-choice':
        return (
          <div className="options-list">
            {question.options?.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-choice':
        return (
          <div className="options-list">
            {question.options?.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={value?.includes(option) || false}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter(v => v !== option);
                    handleResponseChange(question.id, newValue);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter a number..."
            className="preview-input"
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case 'file-upload':
        return (
          <div className="file-upload-preview">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleResponseChange(question.id, file.name);
                }
              }}
            />
            <div className="file-upload-info">
              <small>
                {question.validation?.maxSize && `Max size: ${question.validation.maxSize}MB`}
                {question.validation?.allowedTypes && ` • Allowed: ${question.validation.allowedTypes}`}
              </small>
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const currentSectionData = assessment.sections[currentSection];

  return (
    <div className="assessment-preview">
      <div className="preview-header">
        <Button onClick={onBack} variant="outline" icon={ArrowLeft}>
          Back to Builder
        </Button>
        <h1>{assessment.title}</h1>
      </div>

      <div className="preview-content">
        <div className="sections-nav">
          {assessment.sections.map((section, index) => (
            <button
              key={section.id}
              className={`section-nav-item ${index === currentSection ? 'active' : ''}`}
              onClick={() => setCurrentSection(index)}
            >
              {section.title || `Section ${index + 1}`}
            </button>
          ))}
        </div>

        <div className="section-preview">
          <div className="section-header">
            <h2>{currentSectionData.title}</h2>
            {currentSectionData.description && (
              <p className="section-description">{currentSectionData.description}</p>
            )}
          </div>

          <div className="questions-preview">
            {currentSectionData.questions.map((question, index) => (
              <div key={question.id} className="question-preview">
                <div className="question-header">
                  <h3>
                    {index + 1}. {question.question}
                    {question.required && <span className="required-star">*</span>}
                  </h3>
                  {question.description && (
                    <p className="question-description">{question.description}</p>
                  )}
                </div>
                
                <div className="question-response">
                  {renderQuestion(question)}
                </div>
              </div>
            ))}
          </div>

          <div className="preview-actions">
            {currentSection > 0 && (
              <Button
                onClick={() => setCurrentSection(currentSection - 1)}
                variant="outline"
              >
                Previous Section
              </Button>
            )}
            
            {currentSection < assessment.sections.length - 1 ? (
              <Button
                onClick={() => setCurrentSection(currentSection + 1)}
              >
                Next Section
              </Button>
            ) : (
              <Button icon={Send}>
                Submit Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}