'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotesWidget from './NotesWidget';
import { getLessonById, shanghaiDateKey } from './curriculum';

type Favorite = { itemId: string; itemType: string; title: string; summary: string };
type QuizResult = { score: number; feedback: string; reference: string };

function displayDate(dateKey: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', weekday: 'short' })
    .format(new Date(`${dateKey}T12:00:00+08:00`));
}

export default function LessonPage({ lessonId }: { lessonId: string }) {
  const entry = getLessonById(lessonId);
  const lesson = entry?.lesson;
  const task = entry?.task;
  const plan = entry?.plan;
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [done, setDone] = useState(false);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isFuture = Boolean(plan && plan.date > shanghaiDateKey());
  const planDate = plan?.date;

  useEffect(() => {
    if (!planDate) return;
    fetch(`/api/state?date=${planDate}`).then((response) => response.json()).then((data) => {
      setFavorites(data.favorites ?? []);
      setDone((data.progress ?? []).some((item: { itemId: string; completed: number }) => item.itemId === lessonId && item.completed));
    }).catch(() => undefined);
  }, [lessonId, planDate]);

  if (!lesson || !task || !plan) return <main className="lesson-not-found"><h1>课程不存在</h1><Link href="/">返回工作台</Link></main>;

  async function toggleFavorite(item: Favorite) {
    const saved = !favorites.some((favorite) => favorite.itemId === item.itemId);
    setFavorites(saved ? [item, ...favorites] : favorites.filter((favorite) => favorite.itemId !== item.itemId));
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'toggle-favorite', ...item, saved }) });
  }

  async function submitQuiz() {
    if (answer.trim().length < 12 || isFuture) return;
    setSubmitting(true);
    const response = await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'answer', learningDate: plan.date, questionId: lesson.quiz.id, questionTitle: lesson.quiz.question, itemType: `${lesson.type}·学完自检`, answer }) });
    setResult(await response.json()); setSubmitting(false);
  }

  async function toggleComplete() {
    if (isFuture) return;
    const completed = !done; setDone(completed);
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'toggle-task', learningDate: plan.date, itemId: lessonId, taskType: task.track, completed }) });
  }

  const lessonFavorite: Favorite = { itemId: `lesson-${lessonId}`, itemType: lesson.type, title: lesson.title, summary: `${plan.date} · ${lesson.intro}` };
  const quizFavorite: Favorite = { itemId: `quiz-${lesson.quiz.id}`, itemType: '学习答题', title: lesson.quiz.question, summary: result ? `${result.feedback} 参考：${result.reference}` : lesson.quiz.hint };
  const lessonSaved = favorites.some((item) => item.itemId === lessonFavorite.itemId);
  const quizSaved = favorites.some((item) => item.itemId === quizFavorite.itemId);

  return <div className="lesson-page">
    <header className="lesson-topbar"><Link className="lesson-brand" href={`/?date=${plan.date}`}><span>知</span><b>知行工坊</b></Link><div><Link href={`/?date=${plan.date}`}>← 返回第 {plan.dayNumber} 天</Link><button className={lessonSaved ? 'saved' : ''} onClick={() => toggleFavorite(lessonFavorite)}>{lessonSaved ? '♥ 已收藏课程' : '♡ 收藏课程'}</button></div></header>
    <div className="lesson-layout">
      <aside className="lesson-toc"><span className="eyebrow">DAY {String(plan.dayNumber).padStart(2, '0')} · {lesson.type}</span><b>{lesson.duration}</b><nav>{lesson.sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.heading}>{section.heading}</a>)}</nav><a className="toc-quiz" href="#self-check">学完自检 →</a></aside>
      <main className="lesson-article">
        {isFuture ? <div className="trial-banner"><b>课程预览</b><span>{displayDate(plan.date)} 才能作答和打卡；你可以提前查看教学大纲。</span></div> : null}
        <section className="lesson-hero"><p>{displayDate(plan.date)} · {lesson.type} · 完整课程</p><h1>{lesson.title}</h1><div>{lesson.intro}</div></section>
        <section className="lesson-outcomes"><span>学完你应该能够</span><ol>{lesson.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ol></section>
        {lesson.sections.map((section, index) => <section className="lesson-chapter" id={`section-${index + 1}`} key={section.heading}><span>{String(index + 1).padStart(2, '0')}</span><h2>{section.heading.replace(/^\d+\s*/, '').replace(/^0\d\s*/, '')}</h2><p>{section.body}</p>{section.example ? <div className="concept-example"><b>具体落点</b><code>{section.example}</code></div> : null}</section>)}
        <section className="lesson-takeaways"><span className="eyebrow">核心结论</span><h2>离开这页前，确保你能复述这三点</h2><ol>{lesson.points.map((point) => <li key={point}>{point}</li>)}</ol></section>
        <section className="lesson-code"><div><span className="eyebrow">代码镜头</span><b>{lesson.codeTitle}</b></div><pre>{lesson.code}</pre></section>
        <section className="lesson-references"><span className="eyebrow">官方资料</span><div>{lesson.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<span>↗</span></a>)}</div></section>
        <section className="lesson-self-check" id="self-check"><span className="eyebrow">学完自检 · 答题—评分—讲解</span><h2>{lesson.quiz.question}</h2><p>{lesson.quiz.hint}</p>{!result ? <><textarea rows={9} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="先用自己的话回答。建议至少 80 字…" disabled={isFuture} /><div className="self-check-actions"><span>{answer.length} 字</span><button disabled={isFuture || answer.trim().length < 12 || submitting} onClick={submitQuiz}>{isFuture ? '尚未开放' : submitting ? '评分中…' : '提交并查看讲解 →'}</button></div></> : <div className="quiz-result"><div className={`result-score ${result.score < 80 ? 'low' : ''}`}><b>{result.score}</b><span>/ 100</span></div><div><h3>{result.score < 80 ? '已计入错题集' : '已掌握核心结构'}</h3><p>{result.feedback}</p></div><section><b>讲解与参考答案</b><p>{result.reference}</p></section><div className="quiz-result-actions"><button className={quizSaved ? 'saved' : ''} onClick={() => toggleFavorite(quizFavorite)}>{quizSaved ? '♥ 已收藏本题' : '♡ 收藏本题与讲解'}</button><button onClick={() => { setResult(null); setAnswer(''); }}>重新作答</button></div></div>}</section>
        <section className="lesson-finish"><div><span className="eyebrow">完成课程</span><h2>{isFuture ? '课程尚未开放打卡' : done ? '这节课已完成' : '确认理解后再打卡'}</h2><p>{isFuture ? '到学习日后系统会自动开放。' : '三门课程全部完成后，当天会自动计为完整打卡日。'}</p></div><button className={done ? 'done' : ''} disabled={isFuture} onClick={toggleComplete}>{isFuture ? '尚未开放' : done ? '✓ 已完成，点击取消' : '完成打卡 →'}</button></section>
      </main>
    </div>
    <NotesWidget context={`${plan.date} · ${lesson.title}`} />
  </div>;
}
