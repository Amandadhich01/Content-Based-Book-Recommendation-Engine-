import React from 'react';
import { StarIcon, BookmarkIcon, SparklesIcon, CloseIcon } from './Icons';

export default function BookCard({ 
  book, 
  onSelectBook, 
  onFindSimilar, 
  isBookmarked, 
  onToggleBookmark,
  onDeleteCustomBook,
  isSelected = false
}) {
  const {
    id,
    title,
    authors,
    categories,
    publishedDate,
    averageRating,
    thumbnail,
    similarityScore,
    recommendationReasons,
    isCustom
  } = book;

  return (
    <div className={`book-card ${isSelected ? 'selected-card' : ''}`}>
      {/* Similarity Score Pill if this is a recommended book */}
      {typeof similarityScore === 'number' && (
        <div className="similarity-badge" title="Content Similarity Score">
          <SparklesIcon size={13} />
          <span>{similarityScore}% Match</span>
        </div>
      )}

      {/* User Added Badge if custom book */}
      {isCustom && (
        <div className="custom-badge" title="Added by user">
          User Added
        </div>
      )}

      <div className="card-top-actions">
        {/* Delete custom book button */}
        {isCustom && onDeleteCustomBook && (
          <button
            className="card-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCustomBook(id);
            }}
            title="Delete this book"
          >
            <CloseIcon size={14} />
          </button>
        )}

        {/* Bookmark Button */}
        <button 
          className={`card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(book);
          }}
          title={isBookmarked ? 'Remove from reading list' : 'Save to reading list'}
        >
          <BookmarkIcon size={18} filled={isBookmarked} />
        </button>
      </div>

      {/* Thumbnail */}
      <div className="book-cover-container" onClick={() => onSelectBook(book)}>
        <img 
          src={thumbnail} 
          alt={title} 
          className="book-cover-img" 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80';
          }}
        />
      </div>

      {/* Book Metadata */}
      <div className="book-card-content">
        <div className="book-genre-tag">
          {categories?.[0] || 'General'}
        </div>

        <h3 className="book-title" title={title} onClick={() => onSelectBook(book)}>
          {title}
        </h3>

        <p className="book-author">
          by {authors?.slice(0, 2).join(', ')} {authors?.length > 2 ? 'et al.' : ''}
        </p>

        {/* Explainable recommendation factors */}
        {recommendationReasons && recommendationReasons.length > 0 && (
          <div className="match-reasons-container">
            {recommendationReasons.slice(0, 2).map((reason, i) => (
              <span key={i} className="reason-pill">
                ✓ {reason}
              </span>
            ))}
          </div>
        )}

        {/* Rating & Year */}
        <div className="book-meta-footer">
          {averageRating ? (
            <div className="rating-pill">
              <StarIcon size={14} />
              <span>{averageRating}</span>
            </div>
          ) : (
            <span className="year-text">{publishedDate || 'N/A'}</span>
          )}

          <span className="year-text">{publishedDate ? `(${publishedDate})` : ''}</span>
        </div>

        {/* Action Button: Trigger Recommendation */}
        <div className="card-actions">
          <button 
            className="find-similar-btn"
            onClick={() => onFindSimilar(book)}
            title="Run Content-Based similarity on this book"
          >
            <SparklesIcon size={15} />
            <span>Find Similar</span>
          </button>
          
          <button 
            className="details-link-btn"
            onClick={() => onSelectBook(book)}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
