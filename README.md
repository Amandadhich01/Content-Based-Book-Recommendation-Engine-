# 📚 BookMatch AI - Interactive Content-Based Book Recommendation Engine

A full-featured, responsive web platform built with **React 18, JavaScript (ES6+), HTML5, CSS3**, and **Google Books REST API**. It allows users to browse rich books, **add and manage their own books**, and discover personalized book recommendations using an explainable **Content-Based Similarity Scoring Algorithm**.

---

## ✨ Key Features

1. **➕ Add Your Own Books (Full CRUD):**
   - Interactive modal form to enter **Title, Author(s), Genres/Categories, Synopsis/Description, Cover Image, Rating, Year, Page Count**.
   - Immediate validation and persistent saving to **Browser LocalStorage**.
   - Custom added books are immediately indexed by the **Recommendation Engine** to calculate similarity against all other books!
   - Delete custom books anytime.

2. **🧠 Content-Based Similarity Algorithm (Pure JavaScript):**
   - Weighted multi-factor similarity scoring:
     - **Category / Genre Match (40% Weight):** Jaccard Similarity index.
     - **Author Match (30% Weight):** Direct and co-author match.
     - **Content & Keyword Match (25% Weight):** Stop-word removal, text tokenization, and term matching across titles and descriptions.
     - **Rating Signal (5% Weight):** Normalized quality booster.
   - Generates **Explainable Factors** (e.g. `✓ Same author: Robert C. Martin`, `✓ Shared Category: Computers`, `✓ Shared topics: architecture, clean`).

3. **📚 Rich Preloaded Seed Library:**
   - 12+ preloaded classic and modern titles across Software Engineering (*Clean Code, Pragmatic Programmer, GoF Design Patterns, CLRS*), System Design (*DDIA*), Science Fiction (*Dune, Foundation*), and Personal Growth (*Atomic Habits, Deep Work*).
   - Zero empty-state issues: Works flawlessly even offline or without internet access!

4. **🔍 Hybrid Smart Search & Filters:**
   - Search across titles, authors, descriptions, and genres in real-time.
   - Categorical filter chips (*Computer Science, AI & Data, System Design, Fiction, Habits*).
   - Collection tabs: **All Library Books** vs **👤 My Added Books**.

5. **📑 Reading List & Modals:**
   - Bookmark any book to a persistent Reading List.
   - Rich details modal with full synopsis, metadata specs, and extracted feature tokens used by the recommendation engine.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (Hooks, useMemo, useState, useEffect, Custom State Management)
- **Styling:** Modern CSS3 (Dark/Slate Glassmorphism UI, Responsive Flexbox/Grid, Custom Scrollbars)
- **Data Persistence:** Browser LocalStorage
- **Data Source:** Google Books REST API + Preloaded Master Library
- **Build Tool:** Vite 5

---

## 🚀 How to Run Locally

1. Open terminal in the project directory:
   ```bash
   cd book-recommendation-engine-react
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Or simply double-click `run.bat` on Windows!
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎙️ Interview Talking Points

- **Why Content-Based Recommendation?**
  *"Unlike Collaborative Filtering which requires millions of user ratings (Cold Start problem), Content-Based Filtering recommends books purely based on item metadata (genres, authors, and synopsis keywords). This makes it fast, privacy-friendly, and effective for new users and newly added books."*

- **How do user-added books get recommended?**
  *"When a user inputs a new book with a description and genre, the app normalizes the text, extracts key content tokens, and compares them against the entire library using weighted Jaccard similarity. The user can immediately click 'Find Similar' on their own book to find matching literature."*
