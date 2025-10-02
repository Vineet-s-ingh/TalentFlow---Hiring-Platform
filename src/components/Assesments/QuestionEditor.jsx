// src/components/Assessments/QuestionEditor.jsx
import React, { useState } from 'react';
import { Trash2, Copy, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';

export function QuestionEditor({ question, questionIndex, onUpdate, onDelete, onDuplicate }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateQuestion = (updates) => {
    onUpdate({ ...question, ...updates });
  };

  const updateValidation = (validationUpdates) => {
    updateQuestion({
      validation: { ...question.validation, ...validationUpdates }
    });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    updateQuestion({ options: newOptions });
  };

  const updateOption = (optionIndex, value) => {
    const newOptions = question.options.map((option, index) =>
      index === optionIndex ? value : option
    );
    updateQuestion({ options: newOptions });
  };

  const deleteOption = (optionIndex) => {
    const newOptions = question.options.filter((_, index) => index !== optionIndex);
    updateQuestion({ options: newOptions });
  };

  const addCondition = () => {
    updateQuestion({
      conditional: {
        dependsOn: '',
        condition: 'equals',
        value: '',
        action: 'show'
      }
    });
  };

  const updateCondition = (conditionUpdates) => {
    updateQuestion({
      conditional: { ...question.conditional, ...conditionUpdates }
    });
  };

  const removeCondition = () => {
    const { conditional, ...rest } = question;
    onUpdate(rest);
  };

  const renderQuestionFields = () => {
    switch (question.type) {
      case 'single-choice':
      case 'multi-choice':
        return (
          <div className="options-editor">
            <label>Options</label>
            {question.options?.map((option, index) => (
              <div key={index} className="option-row">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  onClick={() => deleteOption(index)}
                  variant="ghost"
                  size="sm"
                  disabled={question.options.length <= 1}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            <Button onClick={addOption} variant="outline" size="sm">
              Add Option
            </Button>
          </div>
        );

      case 'short-text':
      case 'long-text':
        return (
          <div className="validation-fields">
            <label>Validation</label>
            <Input
              type="number"
              value={question.validation?.maxLength || ''}
              onChange={(e) => updateValidation({ maxLength: parseInt(e.target.value) || undefined })}
              placeholder="Max characters"
            />
          </div>
        );

      case 'numeric':
        return (
          <div className="validation-fields">
            <label>Range Validation</label>
            <div className="range-inputs">
              <Input
                type="number"
                value={question.validation?.min || ''}
                onChange={(e) => updateValidation({ min: parseFloat(e.target.value) || undefined })}
                placeholder="Minimum value"
              />
              <Input
                type="number"
                value={question.validation?.max || ''}
                onChange={(e) => updateValidation({ max: parseFloat(e.target.value) || undefined })}
                placeholder="Maximum value"
              />
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div className="validation-fields">
            <label>File Restrictions</label>
            <Input
              type="number"
              value={question.validation?.maxSize || ''}
              onChange={(e) => updateValidation({ maxSize: parseFloat(e.target.value) || undefined })}
              placeholder="Max file size (MB)"
            />
            <Input
              value={question.validation?.allowedTypes || ''}
              onChange={(e) => updateValidation({ allowedTypes: e.target.value })}
              placeholder="Allowed types (e.g., .pdf,.docx)"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-editor">
      <div className="question-header">
        <div className="question-type-badge">
          {getQuestionTypeLabel(question.type)}
        </div>
        <div className="question-actions">
          <Button
            onClick={onDuplicate}
            variant="ghost"
            size="sm"
            title="Duplicate question"
          >
            <Copy size={14} />
          </Button>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
            title="Advanced settings"
          >
            <Settings size={14} />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            title="Delete question"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="question-content">
        <Input
          value={question.question}
          onChange={(e) => updateQuestion({ question: e.target.value })}
          placeholder="Enter your question here"
          className="question-text-input"
        />
        
        <Input
          value={question.description || ''}
          onChange={(e) => updateQuestion({ description: e.target.value })}
          placeholder="Question description (optional)"
          className="question-description-input"
        />

        {renderQuestionFields()}

        <div className="question-settings">
          <label className="required-checkbox">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion({ required: e.target.checked })}
            />
            Required question
          </label>
        </div>

        {showAdvanced && (
          <div className="advanced-settings">
            <div className="conditional-logic">
              <label>Conditional Logic</label>
              {question.conditional ? (
                <div className="conditional-fields">
                  <Select
                    value={question.conditional.dependsOn}
                    onChange={(value) => updateCondition({ dependsOn: value })}
                    options={[
                      { value: '', label: 'Select question...' }
                      // Would be populated with other question IDs
                    ]}
                  />
                  <Select
                    value={question.conditional.condition}
                    onChange={(value) => updateCondition({ condition: value })}
                    options={[
                      { value: 'equals', label: 'Equals' },
                      { value: 'notEquals', label: 'Not equals' },
                      { value: 'greaterThan', label: 'Greater than' },
                      { value: 'lessThan', label: 'Less than' }
                    ]}
                  />
                  <Input
                    value={question.conditional.value}
                    onChange={(e) => updateCondition({ value: e.target.value })}
                    placeholder="Value"
                  />
                  <Button onClick={removeCondition} variant="outline" size="sm">
                    Remove Condition
                  </Button>
                </div>
              ) : (
                <Button onClick={addCondition} variant="outline" size="sm">
                  Add Conditional Logic
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getQuestionTypeLabel(type) {
  const labels = {
    'short-text': 'Short Text',
    'long-text': 'Long Text',
    'single-choice': 'Single Choice',
    'multi-choice': 'Multiple Choice',
    'numeric': 'Numeric',
    'file-upload': 'File Upload'
  };
  return labels[type] || type;
}