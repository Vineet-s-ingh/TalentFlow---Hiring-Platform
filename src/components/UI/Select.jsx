// src/components/UI/Select.jsx
import React from 'react';
import { clsx } from 'clsx';

export function Select({ value, onChange, options, placeholder, className, ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx('select', className)}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}