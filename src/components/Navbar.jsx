import React, { useState } from 'react';
import { BookOpenIcon, BookmarkIcon, UserIcon, LogOutIcon } from './Icons';

export default function Navbar({ 
  readingListCount = 0, 
  onOpenReadingList, 
  onOpenAddBook,
  currentUser = null,
  onOpenAuth,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <BookOpenIcon size={24} />
          </div>
          <div>
            <h1 className="brand-title">BookMatch AI</h1>
            <p className="brand-subtitle">Content-Based Recommendation Engine</p>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Add Book Button */}
          <button 
            className="add-book-nav-btn"
            onClick={onOpenAddBook}
            title="Add your own book to the dataset"
          >
            <span className="plus-sign">+</span>
            <span>Add Book</span>
          </button>

          {/* Reading List */}
          <button 
            className="reading-list-btn" 
            onClick={onOpenReadingList}
            title="View Saved Books"
          >
            <BookmarkIcon size={18} />
            <span className="nav-btn-text">Reading List</span>
            {readingListCount > 0 && (
              <span className="count-badge">{readingListCount}</span>
            )}
          </button>

          {/* Authentication Section */}
          {currentUser ? (
            <div className="user-profile-menu-container">
              <button 
                className="user-profile-pill"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`Logged in as ${currentUser.name}`}
              >
                <div className="user-avatar-circle">{currentUser.avatar || 'AD'}</div>
                <span className="user-name-text">{currentUser.name.split(' ')[0]}</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-card">
                  <div className="user-dropdown-header">
                    <p className="dropdown-user-name">{currentUser.name}</p>
                    <p className="dropdown-user-email">{currentUser.email}</p>
                    <span className="dropdown-user-role">{currentUser.role || 'Member'}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-logout-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                  >
                    <LogOutIcon size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="sign-in-nav-btn"
              onClick={onOpenAuth}
              title="Sign in or create account"
            >
              <UserIcon size={17} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
