// Service for interacting with Google Books REST API

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// In-memory cache for API queries to minimize requests and boost speed
const apiCache = new Map();

/**
 * Clean & normalize raw Google Books API response item
 */
function normalizeBook(item) {
  const info = item.volumeInfo || {};
  
  // Format image safely (prefer secure HTTPS and high-res if available)
  let thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
  if (thumbnail.startsWith('http://')) {
    thumbnail = thumbnail.replace('http://', 'https://');
  }
  if (!thumbnail) {
    thumbnail = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80';
  }

  return {
    id: item.id,
    title: info.title || 'Untitled',
    subtitle: info.subtitle || '',
    authors: info.authors || ['Unknown Author'],
    publisher: info.publisher || 'Unknown Publisher',
    publishedDate: info.publishedDate ? info.publishedDate.substring(0, 4) : 'N/A',
    description: info.description || 'No description available for this book.',
    categories: info.categories || ['General'],
    pageCount: info.pageCount || null,
    averageRating: info.averageRating || null,
    ratingsCount: info.ratingsCount || null,
    thumbnail,
    previewLink: info.previewLink || '',
    infoLink: info.infoLink || '',
    language: (info.language || 'en').toUpperCase()
  };
}

/**
 * Search books by free text query, title, or author
 */
export async function searchBooks(query = 'technology', maxResults = 24) {
  const cacheKey = `search_${query}_${maxResults}`;
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${BASE_URL}?q=${encoded}&maxResults=${maxResults}&printType=books`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    const data = await res.json();
    const books = (data.items || []).map(normalizeBook);
    apiCache.set(cacheKey, books);
    return books;
  } catch (err) {
    console.error('Failed to fetch books from Google Books API:', err);
    return [];
  }
}

/**
 * Fetch candidate books pool to compare against a target book for recommendations.
 * Uses both the book's primary category and author to retrieve high-relevance candidates.
 */
export async function fetchRecommendationCandidates(targetBook) {
  if (!targetBook) return [];

  const candidatesMap = new Map();
  const queries = [];

  // Query by Category/Genre
  if (targetBook.categories && targetBook.categories.length > 0) {
    const primaryCat = targetBook.categories[0].replace(/[\/&,]/g, ' ').trim();
    queries.push(`subject:${primaryCat}`);
  }

  // Query by Author
  if (targetBook.authors && targetBook.authors.length > 0) {
    queries.push(`inauthor:${targetBook.authors[0]}`);
  }

  // If both empty, fallback to keywords from title
  if (queries.length === 0 && targetBook.title) {
    queries.push(targetBook.title.split(' ')[0]);
  }

  for (const q of queries) {
    try {
      const results = await searchBooks(q, 20);
      for (const b of results) {
        if (b.id !== targetBook.id) {
          candidatesMap.set(b.id, b);
        }
      }
    } catch (e) {
      console.warn(`Candidate fetch error for query ${q}:`, e);
    }
  }

  return Array.from(candidatesMap.values());
}
