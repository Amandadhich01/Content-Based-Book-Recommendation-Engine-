import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';
import ReadingListModal from './components/ReadingListModal';
import AddBookModal from './components/AddBookModal';
import LoginPage from './components/LoginPage';
import { DEFAULT_PRELOADED_BOOKS } from './services/defaultBooks';
import { searchBooks, fetchRecommendationCandidates } from './services/bookApi';
import { getRecommendations } from './services/recommendationEngine';
import { getCurrentUser, logoutUser } from './services/authService';
import { SparklesIcon, BookOpenIcon } from './components/Icons';
import './App.css';

const CATEGORY_KEYWORDS = {
  cs: ['computer science', 'computers', 'programming', 'software', 'algorithms', 'clean code', 'react', 'refactoring', 'functional'],
  ai: ['artificial intelligence', 'machine learning', 'deep learning', 'data science', 'python', 'neural', 'superintelligence'],
  sys: ['system design', 'distributed systems', 'architecture', 'microservices', 'sre', 'devops', 'scalability'],
  fic: ['fiction', 'science fiction', 'space opera', 'dystopian', 'classics', 'novel'],
  psy: ['habits', 'psychology', 'self-help', 'productivity', 'personal development', 'mindset', 'finance', 'behavioral']
};

export default function App() {
  // Navigation View: 'home' | 'login'
  const [currentView, setCurrentView] = useState('home');

  // 1. User Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // 2. Custom User Added Books (Persisted in LocalStorage)
  const [customBooks, setCustomBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('bookmatch_custom_books');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bookmatch_custom_books', JSON.stringify(customBooks));
  }, [customBooks]);

  // 3. Online & Preloaded Books State
  const [apiBooks, setApiBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'custom'

  // 4. Recommendation Engine State
  const [targetBook, setTargetBook] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

  // 5. Modals State
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReadingListOpen, setIsReadingListOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  // 6. Reading List
  const [readingList, setReadingList] = useState(() => {
    try {
      const saved = localStorage.getItem('bookmatch_reading_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('bookmatch_reading_list', JSON.stringify(readingList));
  }, [readingList]);

  // Master Pool: User Custom Books + 28 Curated Preloaded Books + API Books
  const masterBooksPool = useMemo(() => {
    const map = new Map();
    customBooks.forEach((b) => map.set(b.id, b));
    DEFAULT_PRELOADED_BOOKS.forEach((b) => {
      if (!map.has(b.id)) map.set(b.id, b);
    });
    apiBooks.forEach((b) => {
      if (!map.has(b.id)) map.set(b.id, b);
    });
    return Array.from(map.values());
  }, [customBooks, apiBooks]);

  // Filtered Display List
  const displayBooks = useMemo(() => {
    let list = activeTab === 'custom' ? customBooks : masterBooksPool;

    // Filter by Category Chip
    if (activeTab === 'all' && activeCategory !== 'all') {
      const keywords = CATEGORY_KEYWORDS[activeCategory] || [];
      list = list.filter((b) => {
        if (b.categoryKey === activeCategory) return true;
        const bookCategoriesStr = (b.categories || []).join(' ').toLowerCase();
        const bookTitleStr = (b.title || '').toLowerCase();
        const bookDescStr = (b.description || '').toLowerCase();
        return keywords.some((kw) => 
          bookCategoriesStr.includes(kw) || bookTitleStr.includes(kw) || bookDescStr.includes(kw)
        );
      });
    }

    // Filter by free text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const authorMatch = (b.authors || []).some((a) => a.toLowerCase().includes(q));
        const categoryMatch = (b.categories || []).some((c) => c.toLowerCase().includes(q));
        const descMatch = (b.description || '').toLowerCase().includes(q);
        return titleMatch || authorMatch || categoryMatch || descMatch;
      });
    }

    return list;
  }, [activeTab, customBooks, masterBooksPool, activeCategory, searchQuery]);

  // Free text search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setTargetBook(null);
    setRecommendations([]);

    if (query.trim()) {
      setLoading(true);
      try {
        const onlineResults = await searchBooks(query, 16);
        if (onlineResults && onlineResults.length > 0) {
          setApiBooks(onlineResults);
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local dataset:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setApiBooks([]);
    }
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setSearchQuery('');
    setTargetBook(null);
    setRecommendations([]);
  };

  // Run Content-Based Recommendation Algorithm
  const handleFindSimilar = async (book) => {
    setTargetBook(book);
    setIsRecommending(true);

    try {
      let candidates = [];
      try {
        candidates = await fetchRecommendationCandidates(book);
      } catch (e) {
        console.warn('Could not fetch extra candidates from API:', e);
      }

      const combinedPool = [...masterBooksPool, ...candidates];
      const topMatches = getRecommendations(book, combinedPool, 5, 8);
      setRecommendations(topMatches);
    } catch (err) {
      console.error('Error generating recommendations:', err);
    } finally {
      setIsRecommending(false);
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleResetRecommendations = () => {
    setTargetBook(null);
    setRecommendations([]);
  };

  // Add Book Click Handler (Auth Guarded)
  const handleOpenAddBook = () => {
    if (!currentUser) {
      setCurrentView('login');
    } else {
      setIsAddBookOpen(true);
    }
  };

  // Save Custom Book
  const handleSaveCustomBook = (newBook) => {
    const bookWithAuthor = {
      ...newBook,
      addedBy: currentUser?.name || 'Anonymous'
    };
    setCustomBooks((prev) => [bookWithAuthor, ...prev]);
    setActiveTab('custom');
    setTargetBook(null);
    setRecommendations([]);
  };

  // Delete Custom Book
  const handleDeleteCustomBook = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setCustomBooks((prev) => prev.filter((b) => b.id !== bookId));
      if (targetBook?.id === bookId) {
        handleResetRecommendations();
      }
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (book) => {
    setReadingList((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      if (exists) {
        return prev.filter((b) => b.id !== book.id);
      } else {
        return [...prev, book];
      }
    });
  };

  const isBookmarked = (id) => readingList.some((b) => b.id === id);

  // Authentication Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Render Full Page Login if selected
  if (currentView === 'login') {
    return (
      <LoginPage
        onAuthSuccess={handleAuthSuccess}
        onBackToLibrary={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar 
        readingListCount={readingList.length}
        currentUser={currentUser}
        onOpenReadingList={() => setIsReadingListOpen(true)}
        onOpenAddBook={handleOpenAddBook}
        onOpenAuth={() => setCurrentView('login')}
        onLogout={handleLogout}
      />

      {/* Hero Header */}
      <section className="hero-section">
        <div className="hero-pill">
          <SparklesIcon size={14} />
          <span>Interactive Content-Based Recommendation Engine</span>
        </div>
        <h1 className="hero-title">
          Smart Book Discovery <br />
          <span className="gradient-text">Add Books & Get AI Recommendations</span>
        </h1>
        <p className="hero-description">
          Add your own books, browse curated classics, and discover similar titles using 
          content-based keyword, author, and genre similarity scoring.
        </p>

        {/* Action Callouts */}
        <div className="hero-cta-row">
          <button 
            className="hero-add-btn"
            onClick={handleOpenAddBook}
          >
            <span className="plus-icon">+</span>
            <span>{currentUser ? 'Add Your Book Details' : 'Sign In to Add Books'}</span>
          </button>
          <span className="cta-divider">or explore {masterBooksPool.length} books in library below</span>
        </div>

        <SearchBar 
          onSearch={handleSearch}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          customBooksCount={customBooks.length}
        />
      </section>

      {/* Target Book Active Banner */}
      {targetBook && (
        <section className="active-target-banner">
          <div className="target-banner-card">
            <div className="target-banner-info">
              <img 
                src={targetBook.thumbnail} 
                alt={targetBook.title} 
                className="target-thumb" 
              />
              <div>
                <p className="target-label">Currently Comparing Against</p>
                <h3 className="target-title">{targetBook.title}</h3>
                <p className="target-author">
                  by {targetBook.authors?.join(', ')} • {targetBook.categories?.[0] || 'General'}
                  {targetBook.isCustom && <span className="custom-indicator"> (User Added)</span>}
                </p>
              </div>
            </div>

            <button 
              className="reset-recommend-btn"
              onClick={handleResetRecommendations}
            >
              ✕ Clear Filter & Browse All
            </button>
          </div>
        </section>
      )}

      {/* Main Grid */}
      <main className="main-content" id="results-section">
        <div className="section-header">
          <div className="section-title-box">
            {targetBook ? (
              <>
                <SparklesIcon size={22} className="accent-icon" />
                <h2 className="section-title">
                  Top Recommendations for "{targetBook.title.substring(0, 30)}..."
                </h2>
              </>
            ) : (
              <>
                <BookOpenIcon size={22} className="accent-icon" />
                <h2 className="section-title">
                  {activeTab === 'custom' 
                    ? 'Books Added by You' 
                    : activeCategory !== 'all' 
                      ? `${activeCategory.toUpperCase()} Collection`
                      : 'Explore Library Books'}
                </h2>
              </>
            )}
          </div>
          <span className="books-count">
            {targetBook 
              ? `${recommendations.length} recommendations generated` 
              : `${displayBooks.length} books found`}
          </span>
        </div>

        {/* Loading Spinner */}
        {(loading || isRecommending) ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>
              {isRecommending 
                ? 'Calculating Content Similarity Matrix across genres, authors, and keywords...' 
                : 'Searching library...'}
            </p>
          </div>
        ) : (
          <div className="books-grid">
            {targetBook ? (
              recommendations.length > 0 ? (
                recommendations.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelectBook={setSelectedBook}
                    onFindSimilar={handleFindSimilar}
                    isBookmarked={isBookmarked(book.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onDeleteCustomBook={handleDeleteCustomBook}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p>No high-similarity books found for this specific title. Try another book or add more books to compare!</p>
                </div>
              )
            ) : (
              displayBooks.length > 0 ? (
                displayBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelectBook={setSelectedBook}
                    onFindSimilar={handleFindSimilar}
                    isBookmarked={isBookmarked(book.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onDeleteCustomBook={handleDeleteCustomBook}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p className="empty-emoji">📖</p>
                  <h3>No books found in this view</h3>
                  {activeTab === 'custom' ? (
                    <p>You haven't added any books yet! Click the "+ Add Book Details" button above to add your first book.</p>
                  ) : (
                    <p>Try clicking another category chip or "🔥 All Featured".</p>
                  )}
                  {activeTab === 'custom' && (
                    <button 
                      className="hero-add-btn" 
                      style={{ marginTop: '1rem' }}
                      onClick={handleOpenAddBook}
                    >
                      + Add Your First Book
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onFindSimilar={handleFindSimilar}
          isBookmarked={isBookmarked(selectedBook.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Reading List Modal */}
      {isReadingListOpen && (
        <ReadingListModal
          savedBooks={readingList}
          onClose={() => setIsReadingListOpen(false)}
          onRemove={(id) => handleToggleBookmark({ id })}
          onSelectBook={setSelectedBook}
          onFindSimilar={handleFindSimilar}
        />
      )}

      {/* Add New Book Modal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onSaveBook={handleSaveCustomBook}
      />
    </div>
  );
}
