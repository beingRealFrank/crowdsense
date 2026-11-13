import './index.css';

import { StrictMode, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { showToast } from '@devvit/web/client';
import type { Crowd, InitResponse, MyPlay, Recap, ShareResponse, Streak, VoteResponse } from '../shared/api';
import type { Question } from '../shared/questions';
import { roundTo100, verdict } from '../shared/scoring';
import { COLORS, LETTERS } from './palette';
import { Countdown, CrowdDots, SplitBar } from './ui';

type Phase = 'loading' | 'error' | 'pick' | 'read' | 'reveal' | 'done' | 'closed';

const post = async <T,>(url: string, body: unknown, journeyId?: string): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(journeyId ? { 'x-devvit-journey-id': journeyId } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(e?.message ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
};

const evenSplit = (n: number) => roundTo100(Array.from({ length: n }, () => 100 / n));

let SUB = 'this sub';
const subName = () => SUB;

export const App = () => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [init, setInit] = useState<InitResponse | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [pred, setPred] = useState<number[]>([]);
  const [me, setMe] = useState<MyPlay | null>(null);
  const [crowd, setCrowd] = useState<Crowd | null>(null);
  const [streak, setStreak] = useState<Streak>({ current: 0, best: 0 });
  const [saved, setSaved] = useState(true);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const journeyId = useRef('');

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as InitResponse;
        if (data.subreddit) SUB = `r/${data.subreddit}`;
        setInit(data);
        setStreak(data.streak);
        setCrowd(data.crowd);
        setPred(evenSplit(data.question.answers.length));
        if (data.me) {
          setMe(data.me);
          setPick(data.me.pick);
          setPred(data.me.pred);
          setPhase('done');
        } else setPhase(data.open ? 'pick' : 'closed');
        void post('/api/journey/ready', {}).catch(() => undefined);
      } catch (e) {
        console.error(e);
        setPhase('error');
      }
    })();
  }, []);

  const choose = async (i: number) => {
    setPick(i);
    setPhase('read');
    if (!journeyId.current) {
      const r = await post<{ journeyId: string }>('/api/journey/start', {}).catch(() => ({ journeyId: '' }));
      journeyId.current = r.journeyId;
    }
    void post('/api/journey/progress', { progress: 0.5, action: 'answer_picked' }, journeyId.current).catch(() => undefined);
  };

  const lockIn = async () => {
    if (pick === null) return;
    setBusy(true);
    try {
      const r = await post<VoteResponse>('/api/vote', { pick, pred }, journeyId.current);
      setMe(r.me);
      setCrowd(r.crowd);
      setStreak(r.streak);
      setSaved(r.saved);
      setPhase('reveal');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save, try again');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const r = await post<ShareResponse>('/api/share', {}).catch(() => ({ ok: false, message: 'Could not post comment' }));
    showToast(r.message);
  };

  if (phase === 'loading')
    return (
      <Shell>
        <p className="mt-24 text-[var(--muted)] animate-pulse">Counting heads…</p>
      </Shell>
    );
  if (phase === 'error' || !init)
    return (
      <Shell>
        <p className="mt-24 text-[var(--muted)]">Couldn’t load today’s question. Pull to refresh.</p>
      </Shell>
    );

  const q = init.question;

  return (
    <Shell>
      <Header day={init.day} streak={streak.current} voters={crowd?.total ?? init.voters} />
      <h1 className="display text-[1.7rem] leading-[1.1] mt-2 w-full">{q.q}</h1>

      {phase === 'pick' && (
        <>
          <p className="mt-1 w-full text-sm text-[var(--muted)]">Step 1 of 2 · First, your honest answer.</p>
          <div className="mt-3 w-full grid gap-2">
            {q.answers.map((a, i) => (
              <button
                key={i}
                onClick={() => void choose(i)}
                className="pop-in w-full text-left flex items-center gap-3 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-3 shadow-[0_3px_0_var(--ink)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--ink)] transition-transform"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="display w-8 h-8 shrink-0 rounded-lg grid place-items-center text-white text-lg" style={{ background: COLORS[i] }}>
                  {LETTERS[i]}
                </span>
                <span className="font-semibold leading-snug">{a}</span>
              </button>
            ))}
          </div>
          {init.yesterday && <YesterdayCard recap={init.yesterday} />}
        </>
      )}

      {phase === 'read' && pick !== null && (
        <>
          <p className="mt-1 w-full text-sm text-[var(--muted)]">
            Step 2 of 2 · You said <b style={{ color: COLORS[pick] }}>{q.answers[pick]}</b>. Now: how will <b>{subName()}</b> split?
          </p>
          <div className="relative w-full mt-5">
            <SplitBar
              shares={pred}
              onChange={(p) => {
                setPred(p);
                setTouched(true);
              }}
            />
            {!touched && (
              <div className="nudge pointer-events-none absolute -bottom-8 text-xs font-semibold bg-[var(--ink)] text-[var(--paper)] rounded-full px-3 py-1 whitespace-nowrap" style={{ left: `${pred[0]}%` }}>
                ↔ drag the dividers
              </div>
            )}
          </div>
          <ul className="w-full mt-10 space-y-1.5">
            {q.answers.map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i] }} />
                <span className="flex-1 text-sm leading-tight">{a}</span>
                <Stepper
                  value={pred[i]!}
                  onStep={(d) => {
                    setPred(step(pred, i, d));
                    setTouched(true);
                  }}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 w-full flex justify-center">
            <CrowdDots shares={pred} size={12} />
          </div>
          <div className="mt-4 flex gap-3">
            <button className="h-11 px-5 rounded-full border-2 border-[var(--ink)] font-semibold" onClick={() => setPhase('pick')}>
              Back
            </button>
            <button
              disabled={busy}
              className="h-11 px-7 rounded-full bg-[var(--ink)] text-[var(--paper)] font-bold shadow-[0_3px_0_#000] disabled:opacity-50"
              onClick={() => void lockIn()}
            >
              Lock my read
            </button>
          </div>
        </>
      )}

      {(phase === 'reveal' || phase === 'done') && me && crowd && (
        <Reveal
          question={q}
          me={me}
          crowd={crowd}
          animate={phase === 'reveal'}
          onDone={() => setPhase('done')}
          footer={
            phase === 'done' ? (
              <ResultFooter init={init} me={me} streak={streak} saved={saved} onShare={share} />
            ) : null
          }
        />
      )}

      {phase === 'closed' && crowd && (
        <section className="w-full mt-4 pop-in">
          <p className="text-sm text-[var(--muted)]">This poll closed. Here’s how {subName()} answered ({crowd.total} votes).</p>
          <div className="mt-3">
            <SplitBar shares={crowd.shares} />
          </div>
          <Legend question={q} shares={crowd.shares} />
          <p className="mt-4 text-sm">Today’s question is #{init.today}. Find it in the sub.</p>
        </section>
      )}
    </Shell>
  );
};

// Move `d` points into answer i, taking from (or giving to) the others fairly.
const step = (pred: number[], i: number, d: number): number[] => {
  const next = [...pred];
  if (d > 0) {
    if (next[i]! >= 100) return pred;
    const donor = next.map((v, j) => ({ v, j })).filter((x) => x.j !== i && x.v > 0).sort((a, b) => b.v - a.v)[0];
    if (!donor) return pred;
    next[i]! += 1;
    next[donor.j]! -= 1;
  } else {
    if (next[i]! <= 0) return pred;
    const taker = next.map((v, j) => ({ v, j })).filter((x) => x.j !== i).sort((a, b) => a.v - b.v)[0]!;
    next[i]! -= 1;
    next[taker.j]! += 1;
  }
  return next;
};

const Stepper = ({ value, onStep }: { value: number; onStep: (d: number) => void }) => (
  <span className="flex items-center gap-1">
    <button aria-label="less" className="w-7 h-7 rounded-full border-2 border-[var(--ink)] font-bold leading-none" onClick={() => onStep(-1)}>
      −
    </button>
    <span className="display num w-11 text-center text-lg">{value}%</span>
    <button aria-label="more" className="w-7 h-7 rounded-full border-2 border-[var(--ink)] font-bold leading-none" onClick={() => onStep(1)}>
      +
    </button>
  </span>
);

const Shell = ({ children }: { children: ReactNode }) => (
  <div className="paper-grain min-h-screen w-full flex justify-center">
    <div className="w-full max-w-[520px] flex flex-col items-center px-4 pt-3 pb-8">{children}</div>
  </div>
);

const Header = ({ day, streak, voters }: { day: number; streak: number; voters: number }) => (
  <header className="w-full flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="display text-sm tracking-[0.18em] bg-[var(--ink)] text-[var(--paper)] px-2 py-0.5 rounded">CROWDSENSE</span>
      <span className="display text-sm text-[var(--muted)]">#{day}</span>
    </div>
    <div className="text-xs text-[var(--muted)] num flex gap-3">
      <span>👥 {voters}</span>
      {streak > 0 && <span className="text-[#c2410c] font-semibold">🔥 {streak}</span>}
    </div>
  </header>
);

const Legend = ({ question, shares, mark }: { question: Question; shares: number[]; mark?: number | null }) => (
  <ul className="w-full mt-3 space-y-1">
    {question.answers.map((a, i) => (
      <li key={i} className="flex items-center gap-2 text-sm">
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i] }} />
        <span className="flex-1 leading-tight">
          {a}
          {mark === i && <span className="ml-1 text-xs font-semibold text-[var(--muted)]">(you)</span>}
        </span>
        <span className="display num text-lg">{shares[i]}%</span>
      </li>
    ))}
  </ul>
);

const Reveal = (props: { question: Question; me: MyPlay; crowd: Crowd; animate: boolean; onDone: () => void; footer: ReactNode }) => {
  const { question, me, crowd, animate, onDone } = props;
  const [t, setT] = useState(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);
  const ease = 1 - Math.pow(1 - t, 3);
  const shown = roundTo100(me.pred.map((p, i) => p + ((crowd.shares[i] ?? 0) - p) * ease));
  const score = me.score * ease;
  const early = !me.final;
  const sameAsYou = crowd.shares[me.pick] ?? 0;
  return (
    <section className="w-full mt-4">
      <div className="text-xs font-semibold tracking-widest text-[var(--muted)]">YOUR READ</div>
      <div className="mt-1">
        <SplitBar shares={me.pred} height={26} showLabels={false} />
      </div>
      <div className="mt-3 text-xs font-semibold tracking-widest text-[var(--muted)]">
        {early ? (crowd.total < 10 ? `EARLY READ · ${crowd.total} VOTE${crowd.total === 1 ? '' : 'S'} SO FAR` : `THE CROWD SO FAR · ${crowd.total} VOTES`) : `THE FINAL CROWD · ${crowd.total} VOTES`}
      </div>
      <div className="mt-1">
        <SplitBar shares={shown} />
      </div>
      <Legend question={question} shares={shown} mark={me.pick} />
      <div className="mt-4 flex justify-center">
        <CrowdDots shares={shown} highlight={t >= 1 ? me.pick : null} size={13} />
      </div>
      <div className="mt-4 rounded-2xl border-2 border-[var(--ink)] bg-white p-4 shadow-[0_4px_0_var(--ink)]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="display num text-5xl leading-none">{score.toFixed(1)}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: COLORS[0] }}>
              {t >= 1 ? verdict(me.score) : 'Counting…'}
            </div>
          </div>
          <div className="text-right text-sm text-[var(--muted)] leading-snug">
            {me.final ? (
              <div>
                <b className="text-[var(--ink)]">#{me.rank}</b> of {me.players} readers
              </div>
            ) : (
              <div>{crowd.total <= 1 ? 'You’re the first voter!' : 'Provisional score'}</div>
            )}
            <div>{sameAsYou}% answered like you</div>
          </div>
        </div>
        {early && t >= 1 && (
          <p className="mt-3 text-xs text-[var(--muted)]">Your score moves as more of the crowd votes, and locks at midnight UTC. Tomorrow’s post shows the final crowd.</p>
        )}
        {props.footer}
      </div>
    </section>
  );
};

const ResultFooter = (props: { init: InitResponse; me: MyPlay; streak: Streak; saved: boolean; onShare: () => void }) => {
  const { init, streak, saved } = props;
  return (
    <div className="pop-in">
      <div className="mt-4 flex items-center justify-between gap-3">
        {saved ? (
          <button className="h-10 px-4 rounded-full bg-[var(--ink)] text-[var(--paper)] font-bold whitespace-nowrap" onClick={props.onShare}>
            Share my read
          </button>
        ) : (
          <span className="text-xs text-[var(--muted)]">Log in to keep your score</span>
        )}
        <div className="text-xs text-[var(--muted)] text-right">
          {init.open ? (
            <>
              Next question in <Countdown today={init.today} />
            </>
          ) : (
            <>Today’s question is #{init.today}</>
          )}
          {streak.current > 0 && <div>🔥 {streak.current}-day streak (best {streak.best})</div>}
        </div>
      </div>
      {init.readers.length > 0 && (
        <div className="mt-4 border-t-2 border-dashed border-[var(--line)] pt-3">
          <div className="text-xs font-semibold tracking-widest text-[var(--muted)]">BEST CROWD READERS · ALL TIME</div>
          <ol className="mt-1 text-sm space-y-0.5">
            {init.readers.map((r, i) => (
              <li key={r.name} className="flex justify-between">
                <span>
                  {i + 1}. u/{r.name}
                </span>
                <span className="num font-semibold">{r.points} pts</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {init.yesterday && <YesterdayCard recap={init.yesterday} compact />}
    </div>
  );
};

const YesterdayCard = ({ recap, compact = false }: { recap: Recap; compact?: boolean }) => (
  <section className={`w-full ${compact ? 'mt-4 border-t-2 border-dashed border-[var(--line)] pt-3' : 'mt-5 rounded-2xl border-2 border-dashed border-[var(--ink)] p-3'}`}>
    <div className="text-xs font-semibold tracking-widest text-[var(--muted)]">YESTERDAY’S CROWD · #{recap.day}</div>
    <div className="text-sm font-semibold mt-1 leading-snug">{recap.question.q}</div>
    <div className="mt-2">
      <SplitBar shares={recap.crowd.shares} height={30} />
    </div>
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
      {recap.question.answers.map((a, i) => (
        <span key={i}>
          <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: COLORS[i] }} />
          {a}
        </span>
      ))}
    </div>
    <div className="mt-2 text-sm">
      {recap.me ? (
        <>
          You scored <b className="num">{recap.me.score.toFixed(1)}</b>
          {recap.me.final && recap.me.rank > 0 && (
            <>
              {' '}
              · #{recap.me.rank} of {recap.me.players}
            </>
          )}
        </>
      ) : (
        <span className="text-[var(--muted)]">{recap.crowd.total} people voted. You sat this one out.</span>
      )}
    </div>
  </section>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
