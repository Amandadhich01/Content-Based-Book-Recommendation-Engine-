// Content-Based Recommendation Engine in JavaScript
// Calculates content similarity between books based on:
// 1. Categories / Genres (40% weight)
// 2. Authors (30% weight)
// 3. Keyword Content in Title & Description (25% weight)
// 4. Rating & Review signals (5% weight)

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such', 't',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your',
  'book', 'books', 'story', 'novel', 'read', 'readers', 'edition', 'author', 'written', 'published'
]);

/**
 * Tokenize and normalize text into meaningful content keywords.
 */
export function extractKeywords(text = '') {
  if (!text) return new Set();
  const clean = text
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags if any from Google Books API
    .replace(/[^a-z0-9\s]/g, ' '); // Strip punctuation

  const words = clean.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Calculate Jaccard Similarity between two sets: |A ∩ B| / |A ∪ B|
 */
export function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Calculate similarity between target book and candidate book.
 * Returns { score: number, reasons: Array<string>, matchDetails: object }
 */
export function computeContentSimilarity(targetBook, candidateBook) {
  if (!targetBook || !candidateBook) return { score: 0, reasons: [] };
  if (targetBook.id === candidateBook.id) return { score: 100, reasons: ['Exact Match'] };

  // 1. Author Similarity (Weight: 30%)
  const targetAuthors = new Set((targetBook.authors || []).map(a => a.toLowerCase().trim()));
  const candidateAuthors = new Set((candidateBook.authors || []).map(a => a.toLowerCase().trim()));
  let authorScore = 0;
  const commonAuthors = [];
  for (const auth of targetAuthors) {
    if (candidateAuthors.has(auth)) {
      commonAuthors.push(auth);
      authorScore = 1.0;
    }
  }

  // 2. Category / Genre Similarity (Weight: 40%)
  const targetCategories = new Set(
    (targetBook.categories || []).flatMap(c => c.toLowerCase().split(/[\/&,]/).map(s => s.trim()))
  );
  const candidateCategories = new Set(
    (candidateBook.categories || []).flatMap(c => c.toLowerCase().split(/[\/&,]/).map(s => s.trim()))
  );
  const categoryScore = jaccardSimilarity(targetCategories, candidateCategories);
  const commonCategories = [...targetCategories].filter(c => candidateCategories.has(c));

  // 3. Keyword / Content Text Similarity (Weight: 25%)
  const targetText = `${targetBook.title || ''} ${targetBook.subtitle || ''} ${targetBook.description || ''}`;
  const candidateText = `${candidateBook.title || ''} ${candidateBook.subtitle || ''} ${candidateBook.description || ''}`;
  
  const targetKeywords = extractKeywords(targetText);
  const candidateKeywords = extractKeywords(candidateText);
  const textScore = jaccardSimilarity(targetKeywords, candidateKeywords);
  const commonKeywords = [...targetKeywords].filter(k => candidateKeywords.has(k)).slice(0, 5);

  // 4. Rating & Quality Signal (Weight: 5%)
  const rating = candidateBook.averageRating || 3.5;
  const ratingScore = Math.min(rating / 5, 1.0);

  // Calculate Weighted Total Score
  const totalScore = (
    (authorScore * 0.30) +
    (categoryScore * 0.40) +
    (textScore * 0.25) +
    (ratingScore * 0.05)
  );

  // Scale to percentage (1 - 100)
  const percentageScore = Math.min(Math.round(totalScore * 100), 99);

  // Generate explainable reasons for why this book was recommended
  const reasons = [];
  if (commonAuthors.length > 0) {
    reasons.push(`Same author: ${commonAuthors.join(', ')}`);
  }
  if (commonCategories.length > 0) {
    reasons.push(`Genre match: ${commonCategories.slice(0, 2).join(', ')}`);
  }
  if (commonKeywords.length > 0) {
    reasons.push(`Shared topics: ${commonKeywords.slice(0, 3).join(', ')}`);
  }
  if (reasons.length === 0 && percentageScore > 0) {
    reasons.push('Related literary theme & style');
  }

  return {
    score: percentageScore,
    reasons,
    breakdown: {
      authorWeight: Math.round(authorScore * 30),
      categoryWeight: Math.round(categoryScore * 40),
      contentWeight: Math.round(textScore * 25),
      ratingWeight: Math.round(ratingScore * 5),
    }
  };
}

/**
 * Filter and rank recommendations for a given target book from a pool of candidate books.
 * @param {Object} targetBook
 * @param {Array} candidateBooks
 * @param {number} minThreshold - Minimum similarity % required (default 10)
 * @param {number} limit - Maximum recommendations to return (default 6)
 */
export function getRecommendations(targetBook, candidateBooks = [], minThreshold = 10, limit = 6) {
  if (!targetBook || !Array.isArray(candidateBooks)) return [];

  const scoredCandidates = candidateBooks
    .filter(candidate => candidate && candidate.id !== targetBook.id)
    .map(candidate => {
      const { score, reasons, breakdown } = computeContentSimilarity(targetBook, candidate);
      return {
        ...candidate,
        similarityScore: score,
        recommendationReasons: reasons,
        similarityBreakdown: breakdown,
      };
    })
    .filter(candidate => candidate.similarityScore >= minThreshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return scoredCandidates;
}
