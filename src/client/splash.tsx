import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { InitResponse } from '../shared/api';
import { COLORS, LETTERS } from './palette';

// Inline feed view: kept light. Today's question, the answers, and the crowd size.
export const Splash = () => {
  const [data, setData] = useState<InitResponse | null>(null);
  useEffect(() => {
    fetch('/api/init')
      .then((r) => (r.ok ? (r.json() as Promise<InitResponse>) : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);
  const q = data?.question;
  return (
    <div className="paper-grain relative flex flex-col items-center justify-center min-h-screen gap-3 px-5 text-center">
      <div className="flex items-center gap-2">
        <span className="display text-xs tracking-[0.2em] bg-[var(--ink)] text-[var(--paper)] px-2 py-0.5 rounded">CROWDSENSE</span>
        {data && <span className="display text-xs text-[var(--muted)]">#{data.day}</span>}
      </div>
      <h1 className="display text-2xl leading-tight max-w-[440px]">{q ? q.q : 'Today’s question is loading…'}</h1>
      {q && (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-[460px]">
          {q.answers.map((a, i) => (
            <span key={i} className="text-xs font-semibold rounded-full px-2.5 py-1 text-white" style={{ background: COLORS[i] }}>
              {LETTERS[i]} · {a}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm text-[var(--muted)]">
        {data?.me
          ? `Your read scored ${data.me.score.toFixed(1)}${data.me.final ? '' : ' so far'}`
          : data && data.voters > 0
            ? `${data.voters} ${data.voters === 1 ? 'person has' : 'people have'} answered. Can you guess how they split?`
            : 'Answer, then guess how everyone else will.'}
      </p>
      <button
        className="h-11 px-7 rounded-full bg-[var(--ink)] text-[var(--paper)] font-bold shadow-[0_3px_0_#000] cursor-pointer"
        onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
      >
        {data?.me ? 'See the crowd' : 'Read the crowd'}
      </button>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
