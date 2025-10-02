// src/components/UI/Input.jsx
import React from 'react';
import { clsx } from 'clsx';

export function Input({ icon: Icon, error, className, ...props }) {
  return (
    <div className="input-container">
      {Icon && <Icon size={16} className="input-icon" />}
      <input 
        className={clsx('input', { 'input-error': error }, className)} 
        {...props} 
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}