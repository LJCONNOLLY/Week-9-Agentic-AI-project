import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadIndex } from '../utils/data';

const THREADS = [
  {
    id: 'text',
    title: 'What counts as a "text"?',
    terms: ['text'],
  },
  {
    id: 'technology',
    title: 'What counts as "technology"?',
    terms: ['technology'],
  },
  {
    id: 'race-algorithms',
    title: 'Race, algorithms, and data',
    terms: ['race', 'algorithms', 'datafication'],
  },
  {
    id: 'feminist-tech',
    title: 'Feminist approaches to tech',
    terms: ['feminist', 'embodiment', 'design justice'],
  },
  {
    id: 'classification',
    title: 'Classification and categories',
    terms: ['classification', 'categorization', 'normativity'],
  },
  {
    id: 'surveillance',
    title: 'Surveillance and visibility',
    terms: ['surveillance', 'visibility'],
  },
  {
    id: 'embodiment',
    title: 'Bodies, embodiment, and data',
    terms: ['embodiment', 'health', 'biopolitics'],
  },
  {
    id: 'literacy',
    title: 'Literacy, coding, and access',
    terms: ['coding literacy', 'rhetoric'],
  },
  {
    id: 'archives',
    title: 'Archives, erasure, and memory',
    terms: ['erasure', 'transparency'],
  },
];

export default function ThematicThreads() {
  const [index, setIndex] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  if (!index) return <div className="loading">Loading...</div>;

  const selectedThread = THREADS.find(t => t.id === selectedId);

  // Collect passages for the selected thread
  let passages = [];
  if (selectedThread) {
    const bookPassages = {}; // bookId -> { book, passages[] }

    for (const book of index.books) {
      const defs = book.definitions || {};
      const matching = [];

      for (const term of selectedThread.terms) {
        if (defs[term]) {
          for (const d of defs[term]) {
            matching.push({ ...d, matchedTerm: term });
          }
        }
      }

      if (matching.length > 0) {
        // Deduplicate by excerpt
        const seen = new Set();
        const unique = matching.filter(m => {
          const k = m.excerpt.slice(0, 80);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        bookPassages[book.id] = {
          id: book.id,
          title: book.title,
          author: (book.author || []).join(', '),
          year: book.year,
          passages: unique,
        };
      }
    }

    passages = Object.values(bookPassages).sort((a, b) =>
      a.author.localeCompare(b.author)
    );
  }

  // Count passages per thread for the sidebar
  const threadCounts = {};
  for (const thread of THREADS) {
    let count = 0;
    for (const book of index.books) {
      const defs = book.definitions || {};
      for (const term of thread.terms) {
        count += (defs[term] || []).length;
      }
    }
    threadCounts[thread.id] = count;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Thematic Threads</h1>
        <p>What do the authors say about each theme? Go to the thread, not 30 books.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Thread list */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Threads
          </h3>
          {THREADS.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedId(thread.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                border: 'none',
                background: selectedId === thread.id ? 'var(--white)' : 'transparent',
                color: selectedId === thread.id ? 'var(--forest, var(--text-primary))' : 'var(--text-secondary)',
                fontWeight: selectedId === thread.id ? 700 : 400,
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                borderRadius: '4px',
                borderLeft: selectedId === thread.id ? '3px solid var(--coral, #c17a5a)' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '0.25rem',
              }}
            >
              {thread.title}
              <span style={{
                display: 'block', fontSize: '0.85rem', fontWeight: 400,
                color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
                marginTop: '0.1rem',
              }}>
                {threadCounts[thread.id]} passages
              </span>
            </button>
          ))}
        </div>

        {/* Thread content */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {selectedThread ? (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                {selectedThread.title}
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {passages.length} book{passages.length !== 1 ? 's' : ''} with relevant passages
                {' \u2022 '} Terms: {selectedThread.terms.join(', ')}
              </p>

              {passages.map(bookGroup => (
                <div key={bookGroup.id} className="card" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Link to={`/book/${bookGroup.id}`} style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 700,
                      fontSize: '1.2rem',
                    }}>
                      {bookGroup.title}
                    </Link>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                      {bookGroup.author} ({bookGroup.year || 'n.d.'})
                    </p>
                  </div>

                  {bookGroup.passages.map((p, i) => (
                    <div key={i} style={{
                      marginBottom: '0.75rem',
                      paddingLeft: '1rem',
                      borderLeft: '3px solid var(--coral, #c17a5a)',
                    }}>
                      <span style={{
                        fontSize: '0.85rem', color: 'var(--text-muted)',
                        display: 'block', marginBottom: '0.25rem',
                      }}>
                        {p.locator_type} {p.locator} \u2022 matched: {p.matchedTerm}
                      </span>
                      <p style={{
                        fontSize: '1rem', fontStyle: 'italic',
                        color: 'var(--text-secondary)', lineHeight: 1.7,
                      }}>
                        "{highlightTerms(p.excerpt.slice(0, 500), selectedThread.terms)}{p.excerpt.length > 500 ? '...' : ''}"
                      </p>
                    </div>
                  ))}
                </div>
              ))}

              {passages.length === 0 && (
                <div className="empty-state">
                  <p>No passages found for this thread in the extracted definitions.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a thread from the list to see what each author says about that theme.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return text;
  const pattern = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const segments = text.split(regex);
  return segments.map((seg, i) =>
    regex.test(seg)
      ? <mark key={i} style={{ background: '#fff176', padding: '0.05rem 0.15rem', borderRadius: '2px' }}>{seg}</mark>
      : seg
  );
}
