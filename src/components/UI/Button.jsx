// src/components/UI/Button.jsx
import React from 'react';
import { clsx } from 'clsx';

export function Button({ 
  children, 
  icon: Icon, 
  iconPosition = 'left',
  variant = 'primary', 
  className,
  ...props 
}) {
  return (
    <button
      className={clsx('btn', `btn-${variant}`, className)}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  );
}