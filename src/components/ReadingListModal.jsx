import React from 'react';
import { CloseIcon, BookmarkIcon, SparklesIcon } from './Icons';

export default function ReadingListModal({ 
  savedBooks = [], 
  onClose, 
  onRemove, 
  onSelectBook, 
  onFindSimilar 
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content reading-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-box">
            <BookmarkIcon size={22} filled={true} />
            <h2>My Saved Reading List ({savedBooks.length})</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="reading-list-body">
          {savedBooks.length === 0 ? (
            <div className="empty-state">
              <p className="empty-emoji">📚</p>
              <h3>Your reading list is empty</h3>
              <p>Click the bookmark icon on any book card to save books for later reading or recommendation analysis.</p>
            </div>
          ) : (
            <div className="reading-list-items">
              {savedBooks.map((book) => (
                <div key={book.id} className="reading-list-item">
                  <img 
                    src={book.thumbnail} 
                    alt={book.title} 
                    className="item-thumb"
                    onClick={() => {
                      onSelectBook(book);
                      onClose();
                    }}
                  />
                  <div className="item-meta">
                    <h4 
                      onClick={() => {
                        onSelectBook(book);
                        onClose();
                      }}
                    >
                      {book.title}
                    </h4>
                    <p className="item-author">{book.authors?.join(', ')}</p>
                    <span className="item-genre">{book.categories?.[0] || 'General'}</span>
                  </div>

                  <div className="item-actions">
                    <button
                      className="item-recommend-btn"
                      onClick={() => {
                        onFindSimilar(book);
                        onClose();
                      }}
                      title="Find books similar to this"
                    >
                      <SparklesIcon size={14} />
                      <span>Find Similar</span>
                    </button>

                    <button
                      className="item-remove-btn"
                      onClick={() => onRemove(book.id)}
                      title="Remove from list"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
