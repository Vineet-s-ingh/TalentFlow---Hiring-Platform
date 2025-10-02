// src/components/Notes/MentionsTextarea.jsx
import React, { useState, useRef, useEffect } from 'react';
import { User, Users } from 'lucide-react';

const MENTION_USERS = [
  { id: 1, name: 'John Doe', email: 'john@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com' },
];

export const MentionsTextarea = ({ value, onChange, placeholder }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    const text = e.target.value;
    onChange(text);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const atSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (atSymbolIndex !== -1 && /@\w*$/.test(textBeforeCursor)) {
      const query = textBeforeCursor.substring(atSymbolIndex + 1);
      setMentionStart(atSymbolIndex);
      setShowSuggestions(true);
      
      const filtered = MENTION_USERS.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const text = value;
    const beforeMention = text.substring(0, mentionStart);
    const afterMention = text.substring(text.indexOf(' ', mentionStart) || text.length);
    
    const newText = `${beforeMention}@${user.name} ${afterMention}`;
    onChange(newText);
    setShowSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current.focus();
      const newPosition = beforeMention.length + user.name.length + 2;
      textareaRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <div className="mentions-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className="mentions-textarea"
        rows={4}
      />
      
      {showSuggestions && (
        <div className="mentions-suggestions">
          {suggestions.map(user => (
            <div
              key={user.id}
              className="suggestion-item"
              onClick={() => insertMention(user)}
            >
              <User size={16} />
              <div>
                <div className="suggestion-name">{user.name}</div>
                <div className="suggestion-email">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};