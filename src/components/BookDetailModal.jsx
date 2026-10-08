import React from 'react';
import { CloseIcon, StarIcon, BookmarkIcon, SparklesIcon, ExternalLinkIcon } from './Icons';
import { extractKeywords } from '../services/recommendationEngine';

export default function BookDetailModal({ 
  book, 
  onClose, 
  onFindSimilar, 
  isBookmarked, 
  onToggleBookmark 
}) {
  if (!book) return null;

  const keywords = Array.from(extractKeywords(`${book.title} ${book.description}`)).slice(0, 10);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <CloseIcon size={22} />
        </button>

        <div className="modal-body">
          {/* Left Column: Cover & Quick Actions */}
          <div className="modal-cover-col">
            <img 
              src={book.thumbnail} 
              alt={book.title} 
              className="modal-cover-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80';
              }}
            />

            <button 
              className="modal-recommend-btn"
              onClick={() => {
                onFindSimilar(book);
                onClose();
              }}
            >
              <SparklesIcon size={18} />
              <span>Recommend Similar Books</span>
            </button>

            <button 
              className={`modal-save-btn ${isBookmarked ? 'saved' : ''}`}
              onClick={() => onToggleBookmark(book)}
            >
              <BookmarkIcon size={18} filled={isBookmarked} />
              <span>{isBookmarked ? 'In Reading List' : 'Add to Reading List'}</span>
            </button>

            {book.previewLink && (
              <a 
                href={book.previewLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="modal-preview-link"
              >
                <span>Read Preview on Google Books</span>
                <ExternalLinkIcon size={15} />
              </a>
            )}
          </div>

          {/* Right Column: Information & Metadata */}
          <div className="modal-info-col">
            <div className="modal-tags-row">
              {book.categories?.map((cat, i) => (
                <span key={i} className="modal-genre-tag">{cat}</span>
              ))}
              <span className="modal-lang-tag">{book.language}</span>
            </div>

            <h2 className="modal-title">{book.title}</h2>
            {book.subtitle && <h4 className="modal-subtitle">{book.subtitle}</h4>}

            <p className="modal-author">
              Written by <strong>{book.authors?.join(', ')}</strong>
            </p>

            {/* Quick Specs */}
            <div className="modal-specs-grid">
              <div className="spec-item">
                <span className="spec-label">Published</span>
                <span className="spec-val">{book.publishedDate || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Pages</span>
                <span className="spec-val">{book.pageCount ? `${book.pageCount} pages` : 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Rating</span>
                <span className="spec-val">
                  {book.averageRating ? `⭐ ${book.averageRating} / 5` : 'Not Rated'}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Publisher</span>
                <span className="spec-val">{book.publisher || 'N/A'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="modal-synopsis">
              <h3>Synopsis</h3>
              <p>{book.description}</p>
            </div>

            {/* Content-Based Extracted Keywords (Explainability for interview) */}
            <div className="modal-keywords-box">
              <div className="keywords-header">
                <SparklesIcon size={14} />
                <span>Extracted Content Features (Used by Similarity Algorithm):</span>
              </div>
              <div className="keyword-badges">
                {keywords.map((kw, i) => (
                  <span key={i} className="kw-badge">#{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
