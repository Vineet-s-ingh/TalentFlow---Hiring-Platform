// src/components/Layout/Header.jsx
import React from 'react';
import { Briefcase, Bell, Settings, User } from 'lucide-react';

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Briefcase size={24} />
          <span>TalentFlow</span>
        </div>
        <nav className="nav">
          <div className="nav-actions">
            <button className="nav-button">
              <Bell size={20} />
            </button>
            <button className="nav-button">
              <Settings size={20} />
            </button>
            <div className="user-menu">
              <User size={16} />
              <span>HR User</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}