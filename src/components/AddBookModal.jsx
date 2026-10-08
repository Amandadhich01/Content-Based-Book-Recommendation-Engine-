import React, { useState } from 'react';
import { CloseIcon, SparklesIcon, BookOpenIcon } from './Icons';

const PRESET_COVERS = [
  { label: 'Blue Tech', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80' },
  { label: 'Minimalist Clean', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&q=80' },
  { label: 'Classic Library', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80' },
  { label: 'Modern Abstract', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80' },
  { label: 'Sci-Fi Dark', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
];

export default function AddBookModal({ isOpen, onClose, onSaveBook, editBook = null }) {
  const [title, setTitle] = useState(editBook?.title || '');
  const [subtitle, setSubtitle] = useState(editBook?.subtitle || '');
  const [authors, setAuthors] = useState(editBook?.authors ? editBook.authors.join(', ') : '');
  const [categories, setCategories] = useState(editBook?.categories ? editBook.categories.join(', ') : '');
  const [description, setDescription] = useState(editBook?.description || '');
  const [thumbnail, setThumbnail] = useState(editBook?.thumbnail || PRESET_COVERS[0].url);
  const [publishedDate, setPublishedDate] = useState(editBook?.publishedDate || new Date().getFullYear().toString());
  const [pageCount, setPageCount] = useState(editBook?.pageCount || '');
  const [averageRating, setAverageRating] = useState(editBook?.averageRating || 4.5);
  const [publisher, setPublisher] = useState(editBook?.publisher || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Book title is required!');
      return;
    }
    if (!authors.trim()) {
      setError('Please provide at least one author name!');
      return;
    }
    if (!description.trim()) {
      setError('Please add a brief description (this is used by our Recommendation Engine to match keywords)!');
      return;
    }

    const newBook = {
      id: editBook?.id || `custom-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean),
      categories: categories.split(',').map((c) => c.trim()).filter(Boolean),
      description: description.trim(),
      thumbnail: thumbnail.trim() || PRESET_COVERS[0].url,
      publishedDate: publishedDate.trim() || 'N/A',
      pageCount: pageCount ? parseInt(pageCount, 10) : null,
      averageRating: parseFloat(averageRating) || 4.5,
      publisher: publisher.trim() || 'Self Published',
      language: 'EN',
      isCustom: true,
    };

    onSaveBook(newBook);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content add-book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-box">
            <BookOpenIcon size={22} />
            <h2>{editBook ? 'Edit Book Details' : 'Add New Book to Engine'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-book-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-grid">
            {/* Title */}
            <div className="form-group full-width">
              <label>Book Title *</label>
              <input
                type="text"
                placeholder="e.g. System Design Interview or The Alchemist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Subtitle */}
            <div className="form-group">
              <label>Subtitle (Optional)</label>
              <input
                type="text"
                placeholder="e.g. An Insider's Guide"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            {/* Authors */}
            <div className="form-group">
              <label>Author(s) * (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Alex Xu, Sahn Lam"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                required
              />
            </div>

            {/* Categories / Genres */}
            <div className="form-group">
              <label>Genres / Categories (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Computers, System Design, Architecture"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
            </div>

            {/* Year & Pages */}
            <div className="form-group-row">
              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  placeholder="2024"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Page Count</label>
                <input
                  type="number"
                  placeholder="300"
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Rating (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={averageRating}
                  onChange={(e) => setAverageRating(e.target.value)}
                />
              </div>
            </div>

            {/* Description (Used for Content-Based Keyword Extraction!) */}
            <div className="form-group full-width">
              <div className="label-with-tip">
                <label>Synopsis / Description *</label>
                <span className="tip-text">
                  <SparklesIcon size={12} /> Used by Recommendation Engine for Content Matching!
                </span>
              </div>
              <textarea
                rows="4"
                placeholder="Describe what the book is about, core topics, themes, technologies, or story summary. The recommendation engine will tokenize this to match similar books..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Cover Image & Presets */}
            <div className="form-group full-width">
              <label>Cover Image URL</label>
              <input
                type="url"
                placeholder="Paste an image URL, or choose a preset below"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
              <div className="preset-covers">
                <span className="preset-label">Quick Cover Presets:</span>
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`preset-btn ${thumbnail === preset.url ? 'active' : ''}`}
                    onClick={() => setThumbnail(preset.url)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <SparklesIcon size={16} />
              <span>{editBook ? 'Save Changes' : 'Add Book & Enable Recommendations'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
