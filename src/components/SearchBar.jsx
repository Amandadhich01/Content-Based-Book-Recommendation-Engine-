import React, { useState } from 'react';
import { SearchIcon, CloseIcon } from './Icons';

const CATEGORY_FILTERS = [
  { id: 'all', label: '🔥 All Featured' },
  { id: 'cs', label: '💻 Computer Science' },
  { id: 'ai', label: '🧠 AI & Data' },
  { id: 'sys', label: '⚡ System Design' },
  { id: 'fic', label: '📖 Fiction & Sci-Fi' },
  { id: 'psy', label: '📈 Habits & Psychology' },
];

export default function SearchBar({ 
  onSearch, 
  activeCategory, 
  onSelectCategory,
  activeTab, 
  setActiveTab, 
  customBooksCount = 0 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleCategoryClick = (catId) => {
    setSearchTerm('');
    onSelectCategory(catId);
  };

  return (
    <div className="search-section">
      {/* Primary Tab Switcher */}
      <div className="collection-tabs">
        <button
          className={`collection-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Library Books
        </button>
        <button
          className={`collection-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          👤 My Added Books ({customBooksCount})
        </button>
      </div>

      {/* Free text search bar */}
      <form onSubmit={handleSubmit} className="search-bar-wrapper">
        <div className="search-input-box">
          <SearchIcon size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author, topic (e.g. 'Atomic Habits', 'Clean Code', 'Neural Networks')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={handleClear} className="clear-btn">
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {/* Category Pills */}
      {activeTab === 'all' && (
        <div className="category-chips">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${activeCategory === cat.id && !searchTerm ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
