'use client';

import { useEffect, useMemo, useState } from 'react';
import generatedIntel from './generated-intel.json';
import InstallPrompt from './InstallPrompt';
import NotesWidget, { type NoteItem } from './NotesWidget';
import { observeShanghaiDate } from './learning-clock';
import { answerQuestion, dailyEvidence, interviewItems, jobs, models, phases, type InterviewItem } from './content';
import { addDays, COURSE_END_DATE, COURSE_START_DATE, getDailyLearningPlan, getUnitWeek, isCurriculumDate, resolveLearningDate, shanghaiDateKey, type DailyLearningPlan, type DailyQuestion } from './curriculum';

type View = 'today' | 'plan' | 'insights' | 'qa' | 'notes' | 'interviews' | 'jobs' | 'mistakes' | 'favorites';
type Favorite = { itemId: string; itemType: string; title: string; summary: string };
type SavedAnswer = { id: string; questionId: string; questionTitle: string; itemType: string; answer: string; score: number; feedback: string; reference: string; createdAt: string };
type QaItem = { id: string; question: string; answer: string; createdAt: string };
type SearchItem = { id: string; kind: string; title: string; detail: string; action: () => void };
type ProgressSummary = { completedDays: number; currentStreak: number; fullDayCompleted: boolean; completedDates: string[] };

type StateResponse = { progress: { itemId: string; completed: number }[]; progressSummary: ProgressSummary; favorites: Favorite[]; answers: SavedAnswer[]; qa: QaItem[]; notes: NoteItem[] };
type AnswerResponse = { score: number; feedback: string; reference: string };

const nav: { id: View; icon: string; label: string }[] = [
  { id: 'today', icon: '◫', label: '今日学习' }, { id: 'plan', icon: '◷', label: '学习计划' },
  { id: 'insights', icon: '◇', label: '模型洞察' }, { id: 'qa', icon: '≟', label: '学习答疑' },
  { id: 'notes', icon: '✎', label: '学习笔记' },
  { id: 'interviews', icon: '▤', label: '面试情报' }, { id: 'jobs', icon: '◎', label: '岗位追踪' },
  { id: 'mistakes', icon: '⌑', label: '错题集' }, { id: 'favorites', icon: '♡', label: '我的收藏' },
];
const mobilePrimaryViews: View[] = ['today', 'plan', 'qa', 'notes'];

function chinaDate(dateKey = shanghaiDateKey()) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${dateKey}T12:00:00+08:00`));
}

export default function Studio() {
  const [view, setView] = useState<View>('today');
  const [selectedDate, setSelectedDate] = useState(() => resolveLearningDate(shanghaiDateKey()));
  const [followToday, setFollowToday] = useState(true);
  const [calendarDate, setCalendarDate] = useState(shanghaiDateKey);
  const [done, setDone] = useState<string[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary>({ completedDays: 0, currentStreak: 0, fullDayCompleted: false, completedDates: [] });
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [qa, setQa] = useState<QaItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<{ score: number; feedback: string; reference: string; trial?: boolean } | null>(null);
  const [filter, setFilter] = useState('全部');
  const [modelFilter, setModelFilter] = useState('全部');
  const [syncing, setSyncing] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const plan = getDailyLearningPlan(selectedDate)!;
  const todayDate = resolveLearningDate(calendarDate);
  const isFuture = selectedDate > calendarDate;


  useEffect(() => {
    let active = true;
    fetch(`/api/state?date=${selectedDate}`).then((response) => response.json() as Promise<StateResponse>).then((data) => {
      if (!active) return;
      setDone((data.progress ?? []).filter((item: { completed: number }) => item.completed).map((item: { itemId: string }) => item.itemId));
      setFavorites(data.favorites ?? []);
      setAnswers(data.answers ?? []);
      setQa(data.qa ?? []);
      setNotes(data.notes ?? []);
      setProgressSummary(data.progressSummary ?? { completedDays: 0, currentStreak: 0, fullDayCompleted: false, completedDates: [] });
    }).catch(() => undefined).finally(() => { if (active) setSyncing(false); });
    return () => { active = false; };
  }, [selectedDate]);

  useEffect(() => {
    function refreshNotes() { fetch(`/api/state?date=${selectedDate}`).then((response) => response.json() as Promise<StateResponse>).then((data) => setNotes(data.notes ?? [])).catch(() => undefined); }
    window.addEventListener('notes:updated', refreshNotes);
    return () => window.removeEventListener('notes:updated', refreshNotes);
  }, [selectedDate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('view');
    const requestedDate = params.get('date');
    if (requested === 'notes') window.setTimeout(() => setView('notes'), 0);
    if (requestedDate && isCurriculumDate(requestedDate)) {
      window.setTimeout(() => {
        setSyncing(true);
        setDraft('');
        setResult(null);
        setQuestionOpen(false);
        setSelectedDate(requestedDate);
        setFollowToday(requestedDate === resolveLearningDate(shanghaiDateKey()));
      }, 0);
    }
  }, []);

  useEffect(() => observeShanghaiDate((date) => {
    setCalendarDate(date);
    const nextDate = resolveLearningDate(date);
    if (!followToday || selectedDate === nextDate) return;
    setSyncing(true);
    setDone([]);
    setProgressSummary({ completedDays: 0, currentStreak: 0, fullDayCompleted: false, completedDates: [] });
    setDraft('');
    setResult(null);
    setQuestionOpen(false);
    setSelectedDate(nextDate);
    const url = new URL(window.location.href);
    url.searchParams.set('date', nextDate);
    window.history.replaceState({}, '', url);
  }), [followToday, selectedDate]);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen(true);
      }
      if (event.key === 'Escape') { setSearchOpen(false); setEvidenceOpen(false); }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  function changeView(next: View) { setView(next); setMobileMoreOpen(false); window.scrollTo(0, 0); }

  function changeDate(nextDate: string) {
    if (!isCurriculumDate(nextDate)) return;
    setSyncing(true);
    setDraft('');
    setResult(null);
    setQuestionOpen(false);
    setSelectedDate(nextDate);
    setFollowToday(nextDate === resolveLearningDate(shanghaiDateKey()));
    const url = new URL(window.location.href); url.searchParams.set('date', nextDate); window.history.replaceState({}, '', url);
    window.scrollTo(0, 0);
  }

  async function toggleTask(itemId: string, taskType: string) {
    if (isFuture || plan.contentStatus !== 'ready') return;
    const completed = !done.includes(itemId);
    setDone(completed ? [...done, itemId] : done.filter((id) => id !== itemId));
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'toggle-task', learningDate: selectedDate, itemId, taskType, completed }) });
    const refreshed = await fetch(`/api/state?date=${selectedDate}`).then((response) => response.json() as Promise<StateResponse>);
    setDone((refreshed.progress ?? []).filter((item: { completed: number }) => item.completed).map((item: { itemId: string }) => item.itemId));
    setProgressSummary(refreshed.progressSummary);
  }

  async function toggleFavorite(item: Favorite) {
    const saved = !favorites.some((favorite) => favorite.itemId === item.itemId);
    setFavorites(saved ? [item, ...favorites] : favorites.filter((favorite) => favorite.itemId !== item.itemId));
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'toggle-favorite', ...item, saved }) });
  }

  async function submitAnswer() {
    if (draft.trim().length < 12 || isFuture || plan.contentStatus !== 'ready') return;
    const response = await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'answer', learningDate: selectedDate, questionId: plan.question.id, questionTitle: plan.question.title, itemType: '每日思考题', answer: draft }) });
    const data = await response.json() as AnswerResponse; setResult(data);
    setAnswers([{ id: crypto.randomUUID(), questionId: plan.question.id, questionTitle: plan.question.title, itemType: '每日思考题', answer: draft, score: data.score, feedback: data.feedback, reference: data.reference, createdAt: new Date().toISOString() }, ...answers]);
  }

  async function askQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const item = { id: crypto.randomUUID(), question: trimmed, answer: answerQuestion(trimmed), createdAt: new Date().toISOString() };
    setQa((current) => [item, ...current]);
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'save-qa', ...item }) });
  }

  const lowAnswers = answers.filter((answer) => answer.score < 80);
  const filteredQuestions = useMemo(() => filter === '全部' ? interviewItems : interviewItems.filter((item) => item.cat === filter), [filter]);
  const filteredModels = useMemo(() => modelFilter === '全部' ? models : models.filter((item) => item.family === modelFilter), [modelFilter]);
  const searchItems = useMemo<SearchItem[]>(() => [
    ...plan.tasks.map((task) => ({ id: `lesson-${task.id}`, kind: `${selectedDate} · ${task.type}`, title: task.title, detail: task.type, action: () => { window.location.href = `/learn/${task.id}`; } })),
    ...models.map((model) => ({ id: `model-${model.id}`, kind: model.family, title: model.name, detail: `${model.team} · ${model.highlight}`, action: () => { changeView('insights'); setModelFilter(model.family); setSearchOpen(false); } })),
    ...interviewItems.map((item) => ({ id: `question-${item.id}`, kind: '面试题', title: item.q, detail: `${item.cat} · ${item.source}`, action: () => { changeView('interviews'); setFilter(item.cat); setSearchOpen(false); } })),
    ...jobs.map((job) => ({ id: `job-${job.id}`, kind: '岗位', title: `${job.company} · ${job.role}`, detail: `${job.city} · ${job.skills.join(' / ')}`, action: () => { changeView('jobs'); setSearchOpen(false); } })),
  ], [plan, selectedDate]);
  const searchResults = searchItems.filter((item) => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 12);
  const activeTitle = nav.find((item) => item.id === view)?.label;

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand brand-button" onClick={() => changeView('today')} aria-label="知行工坊首页"><span className="brand-mark">知</span><span><strong>知行工坊</strong><small>Embodied Lab</small></span></button>
      <nav className="nav-list" aria-label="主导航">{nav.map((item) => <button key={item.id} className={`nav-item ${mobilePrimaryViews.includes(item.id) ? '' : 'nav-secondary'} ${view === item.id ? 'active' : ''}`} onClick={() => changeView(item.id)}><span>{item.icon}</span>{item.label}{item.id === 'mistakes' && lowAnswers.length > 0 ? <b>{lowAnswers.length}</b> : null}</button>)}<button className={`nav-item nav-more ${mobilePrimaryViews.includes(view) ? '' : 'active'}`} aria-expanded={mobileMoreOpen} onClick={() => setMobileMoreOpen(!mobileMoreOpen)}><span>•••</span>更多</button></nav>
      <div className="side-goal"><span className="eyebrow">年度目标</span><strong>从感知工程师到<br />具身算法工程师</strong><div className="goal-meter"><span /></div><small>2026 · 9 月 1 日正式开始</small></div>
      <div className="profile"><span className="avatar">XZ</span><span><strong>学习者</strong><small>杭州 · 模型 / 数据</small></span><span className={`sync-dot ${syncing ? 'loading' : ''}`} title={syncing ? '同步中' : '已同步'} /></div>
    </aside>

    {mobileMoreOpen ? <div className="mobile-more" role="dialog" aria-modal="true" aria-label="更多学习功能"><button className="mobile-more-backdrop" onClick={() => setMobileMoreOpen(false)} aria-label="关闭更多菜单" /><section><div><b>更多学习功能</b><button onClick={() => setMobileMoreOpen(false)} aria-label="关闭">×</button></div>{nav.filter((item) => !mobilePrimaryViews.includes(item.id)).map((item) => <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => changeView(item.id)}><span>{item.icon}</span><b>{item.label}</b>{item.id === 'mistakes' && lowAnswers.length > 0 ? <em>{lowAnswers.length}</em> : null}</button>)}</section></div> : null}

    <main className="main" id="top">
      <InstallPrompt />
      {isFuture ? <div className="trial-banner"><b>未来课程预览</b><span>课程会在北京时间当天 00:00 自动开放；未来日期不能提前打卡或提交练习。</span></div> : null}
      <header className="topbar"><div><p className="date">{chinaDate(selectedDate)} · {selectedDate === todayDate ? '今日课程' : isFuture ? '课程预览' : '历史回看'}</p><h1>{view === 'today' ? `第 ${plan.dayNumber} 天 · ${plan.unitTitle}` : activeTitle} <span>↗</span></h1></div><div className="header-actions"><button className="search" aria-label="搜索" onClick={() => setSearchOpen(true)}>⌕ <span>搜索今日课程、模型、岗位或题目</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="查看今日情报" onClick={() => setEvidenceOpen(true)}>◌<i /></button></div></header>

      {view === 'today' && <TodayView plan={plan} selectedDate={selectedDate} todayDate={todayDate} isFuture={isFuture} done={done} progressSummary={progressSummary} favorites={favorites} onFavorite={toggleFavorite} onToggle={toggleTask} onQuestion={() => { setQuestionOpen(true); setResult(null); }} onEvidence={() => setEvidenceOpen(true)} onDate={changeDate} />}
      {view === 'plan' && <PlanView plan={plan} selectedDate={selectedDate} onDate={changeDate} />}
      {view === 'insights' && <InsightsView favorites={favorites} onFavorite={toggleFavorite} filter={modelFilter} setFilter={setModelFilter} items={filteredModels} />}
      {view === 'qa' && <QaView qa={qa} onAsk={askQuestion} favorites={favorites} onFavorite={toggleFavorite} />}
      {view === 'notes' && <NotesView notes={notes} onNotes={setNotes} />}
      {view === 'interviews' && <InterviewsView filter={filter} setFilter={setFilter} items={filteredQuestions} onQuestion={() => { setQuestionOpen(true); setResult(null); }} />}
      {view === 'jobs' && <JobsView favorites={favorites} onFavorite={toggleFavorite} onLocalSource={() => setEvidenceOpen(true)} />}
      {view === 'mistakes' && <MistakesView answers={lowAnswers} currentQuestionId={plan.question.id} favorites={favorites} onFavorite={toggleFavorite} onRetry={() => { setQuestionOpen(true); setResult(null); }} />}
      {view === 'favorites' && <FavoritesView favorites={favorites} onRemove={toggleFavorite} />}
    </main>

    {questionOpen ? <QuestionModal question={plan.question} draft={draft} setDraft={setDraft} result={result} isFuture={isFuture} onSubmit={submitAnswer} onClose={() => setQuestionOpen(false)} /> : null}
    {searchOpen ? <SearchModal query={searchQuery} setQuery={setSearchQuery} results={searchResults} onClose={() => setSearchOpen(false)} /> : null}
    {evidenceOpen ? <EvidenceModal onClose={() => setEvidenceOpen(false)} /> : null}
    <NotesWidget context={`${selectedDate} · ${activeTitle ?? '全局随手记'}`} />
  </div>;
}

function TodayView({ plan, selectedDate, todayDate, isFuture, done, progressSummary, favorites, onFavorite, onToggle, onQuestion, onEvidence, onDate }: { plan: DailyLearningPlan; selectedDate: string; todayDate: string; isFuture: boolean; done: string[]; progressSummary: ProgressSummary; favorites: Favorite[]; onFavorite: (item: Favorite) => void; onToggle: (id: string, taskType: string) => void; onQuestion: () => void; onEvidence: () => void; onDate: (date: string) => void }) {
  const dailyQuestion = plan.question;
  const ready = plan.contentStatus === 'ready';
  const minutes = plan.tasks.reduce((sum, task) => sum + (parseInt(task.time, 10) || 0), 0);
  const questionFavorite: Favorite = { itemId: `question-${dailyQuestion.id}`, itemType: '每日思考题', title: dailyQuestion.title, summary: dailyQuestion.summary };
  const questionSaved = favorites.some((item) => item.itemId === questionFavorite.itemId);
  const completedCount = plan.tasks.filter((task) => done.includes(task.id)).length;
  const nextTask = plan.tasks.find((task) => !done.includes(task.id)) ?? plan.tasks[0];
  const continueLabel = progressSummary.fullDayCompleted ? '回顾本日课程' : selectedDate === todayDate ? '继续今日学习' : isFuture ? '预览本日课程' : '继续本日课程';
  return <><section className="day-switcher"><button disabled={selectedDate <= COURSE_START_DATE} onClick={() => onDate(addDays(selectedDate, -1))}>← 前一天</button><div><span>北京时间学习日</span><b>{selectedDate} · DAY {String(plan.dayNumber).padStart(2, '0')}</b><small>{plan.unitTitle}</small></div><button disabled={selectedDate >= COURSE_END_DATE} onClick={() => onDate(addDays(selectedDate, 1))}>后一天 →</button><button className="today-jump" disabled={selectedDate === todayDate} onClick={() => onDate(todayDate)}>回到今天</button></section><section className="hero"><div className="hero-copy"><p className="kicker">{selectedDate === todayDate ? '今日主题' : isFuture ? '未来课程' : '历史课程'} · DAY {String(plan.dayNumber).padStart(2, '0')}</p><h2>{plan.theme}<br /><em>{plan.unitTitle}</em></h2><p>{plan.unitOutcome}</p><div className="hero-meta"><span><b>{ready ? minutes : '—'}</b> 分钟</span><span><b>{ready ? 3 : 0}</b> 门正文已备课</span><span><b>{ready ? 4 : 0}</b> 道专项题</span></div>{nextTask ? <a className="mobile-continue" href={`/learn/${nextTask.id}`}><span><small>{completedCount} / 3 已完成</small><b>{continueLabel}</b></span><strong>开始 →</strong></a> : null}</div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-a"><span>基</span></div><div className="orbit orbit-b"><span>码</span></div><div className="orbit orbit-c"><span>路</span></div><div className="robot-core"><i className="eye left" /><i className="eye right" /><span>{plan.dayNumber}</span></div><div className="grid-plane" /></div></section>
    <div className={'course-status' + (ready ? '' : ' pending')}>{ready ? <><b>{plan.revision ?? '原始专题课'}</b><br />当日产出：{plan.deliverable}<br />正文含独立讲解、练习与阅读定位；延伸资料不要求当天读完。</> : <><b>当前为教学计划，正文待备课审核</b><br />未编写的课程不再由模板填充。只有完成独立讲解、公式/案例、代码检查和专项题后才开放学习打卡。</>}</div>
    <div className="content-grid"><section className="today-panel"><div className="section-heading"><div><span className="eyebrow">{isFuture ? '课程预览' : '当日必修'}</span><h3>{progressSummary.fullDayCompleted ? '当日完整打卡已自动记录' : '完成三门课程，自动记为完整打卡日'}</h3></div><span className="completion">{completedCount} / 3 完成</span></div><div className="task-list">{plan.tasks.map((task, index) => { const checked = done.includes(task.id); const favorite: Favorite = { itemId: `lesson-${task.id}`, itemType: task.type, title: task.title, summary: `${selectedDate} · ${ready ? '已备课' : '教学计划'} · ${task.time}` }; const saved = favorites.some((item) => item.itemId === favorite.itemId); return <article className={`task-card ${checked ? 'done' : ''}`} key={task.id}><span className={`task-index ${task.color}`}>0{index + 1}</span><a className="task-copy" href={`/learn/${task.id}`}><p><span>{task.type}</span><small>{task.time} · {ready ? '讲解与练习' : '教学计划'}</small></p><h4>{task.title}</h4></a><div className="task-controls"><button className={`task-favorite ${saved ? 'saved' : ''}`} aria-label={saved ? '取消收藏课程' : '收藏课程'} onClick={() => onFavorite(favorite)}>{saved ? '♥' : '♡'}</button><button className="check-button" disabled={isFuture || !ready} aria-label={checked ? '标记为未完成' : '标记完成'} onClick={() => onToggle(task.id, task.track)}>{checked ? '✓' : isFuture ? '·' : '→'}</button></div></article>; })}</div></section>
      <aside className="right-rail"><section className="streak-card"><div className="section-heading compact"><div><span className="eyebrow">完整打卡统计</span><h3>累计完成 / 当前连续</h3></div><b>{progressSummary.completedDays} <small>天</small></b></div><div className="streak-pair"><span>连续 <b>{progressSummary.currentStreak}</b> 天</span><span>计划 <b>{plan.totalDays}</b> 天</span></div><p>三门课程全部完成后自动计入；历史日期可以补签，未来日期不会提前计入。</p></section><section className="question-card"><div className="question-card-head"><span className="eyebrow">DAY {String(plan.dayNumber).padStart(2, '0')} 思考题 · 当日关联</span><button className={questionSaved ? 'saved' : ''} onClick={() => onFavorite(questionFavorite)} aria-label="收藏每日思考题">{questionSaved ? '♥' : '♡'}</button></div><h3>{dailyQuestion.title}</h3><div className="question-meta"><span>{plan.unitTitle}</span><span>中等</span></div><button className="question-start" disabled={isFuture || !ready} onClick={onQuestion}>{!ready ? '待备课' : isFuture ? '尚未开放' : '开始思考'} <span>→</span></button></section></aside></div>
    <section className="daily-signal"><span className="signal-mark">RL</span><div><span className="eyebrow">学习主线已增强 · {generatedIntel.status === 'no_change' ? '今日情报无新增' : '情报已更新'}</span><h3>从模仿学习走向 HIL-SERL、RECAP 与 Evo-RL 的真机闭环</h3><p>强化学习不再只是岗位关键词，已进入 9—12 月学习、数据采集和 SO-101 作品路线。</p></div><button onClick={onEvidence}>查看依据 →</button></section></>;
}

function PlanView({ plan, selectedDate, onDate }: { plan: DailyLearningPlan; selectedDate: string; onDate: (date: string) => void }) { const unitDays = getUnitWeek(selectedDate); return <div className="page-view"><section className="page-intro"><span className="eyebrow">2026.09.01 — 2026.12.31 · 共 {plan.totalDays} 个学习日</span><h2>从「模仿会做」到「从真实经验中 <em>持续改进</em>」</h2><p>122 天教学计划保留；每个日期的正文需单独备课并检查，未完成的日期明确显示“待备课”。已备课课程按北京时间自动切换。</p></section><section className="roadmap">{phases.map((phase, index) => <article className="phase" key={phase.month}><span className="phase-number">{index + 1}</span><div className="phase-date">{phase.month}<small>{phase.tag}</small></div><div className="phase-copy"><h3>{phase.title}</h3><p>{phase.detail}</p><strong>{phase.output}</strong></div></article>)}</section><section className="week-plan"><div className="section-heading"><div><span className="eyebrow">单元 {plan.unitNumber} · 当前 7 日安排</span><h3>{plan.unitTitle}</h3></div><span className="plan-principle">本单元产出：{plan.deliverable}</span></div><div className="day-grid">{unitDays.map((day) => <article className={day.active ? 'active-day' : ''} key={day.date} onClick={() => onDate(day.date)}><span>{day.date.slice(5)}<b>DAY {day.dayNumber}</b></span><strong>{day.theme}</strong><small>{day.active ? '当前查看' : day.ready ? '正文已备课 · 查看课程' : '待备课 · 查看计划'}</small></article>)}</div></section></div>; }

function InsightsView({ favorites, onFavorite, filter, setFilter, items }: { favorites: Favorite[]; onFavorite: (item: Favorite) => void; filter: string; setFilter: (value: string) => void; items: typeof models }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">VLA · WORLD MODEL · REAL-WORLD RL</span><h2>不只问模型「输出什么」，还要问「如何从经验改进」</h2><p>在原有 VLA 与 World Model 地图上，新增 HIL-SERL、π*0.6 / RECAP 和 Evo-RL，比较它们如何使用演示、自主 rollout、人工介入与 value / advantage。</p></section><div className="filters model-filters">{['全部','VLA','World Model','World + Action','Real-world RL','RL + VLA'].map((family) => <button key={family} className={filter === family ? 'active' : ''} onClick={() => setFilter(family)}>{family}</button>)}</div><section className="insight-summary"><span>RL</span><div><b>新的主线</b><h3>Policy 解决「现在做什么」，World Model 预演「做了会发生什么」，RL 用真实结果学会「哪种做法更好」。</h3></div></section><div className="model-grid">{items.map((model) => { const saved = favorites.some((item) => item.itemId === model.id); return <article className="model-card" key={model.id}><div className="model-top"><span>{model.name.slice(0, 2)}</span><div><small>{model.team} · {model.family}</small><h3>{model.name}</h3></div><button className={saved ? 'saved' : ''} onClick={() => onFavorite({ itemId: model.id, itemType: '模型洞察', title: model.name, summary: model.highlight })}>{saved ? '♥' : '♡'}</button></div><dl><div><dt>规模</dt><dd>{model.scale}</dd></div><div><dt>输出 / 动作</dt><dd>{model.action}</dd></div><div><dt>数据</dt><dd>{model.data}</dd></div></dl><h4>{model.highlight}</h4><p>{model.code}</p><a href={model.url} target="_blank" rel="noreferrer">查看官方工作 ↗</a></article>; })}</div><section className="code-lens"><span className="eyebrow">代码对比镜头 · IMITATION VS EXPERIENCE</span><div className="compare-code"><article><b>BC / VLA 基线</b><code>actions = policy(observation, language)<br />loss = distance(actions, expert_actions)</code><p>从专家演示学习，稳定易扩展，但很难超过演示者，且不了解 policy 自己的失败分布。</p></article><article><b>RECAP / Evo-RL 闭环</b><code>value = train_value(rollouts)<br />policy = improve(policy, advantage(value))</code><p>将自主经验、人工介入和成功/失败回收进数据池，通过 value / advantage 实现迭代改进。</p></article></div></section></div>; }

function QaView({ qa, onAsk, favorites, onFavorite }: { qa: QaItem[]; onAsk: (question: string) => void; favorites: Favorite[]; onFavorite: (item: Favorite) => void }) {
  const [question, setQuestion] = useState('');
  const suggestions = ['BC、ACT 和 VLA 到底是什么关系？', '世界模型与 VLA 怎么分工？', '图像、关节状态和动作时延怎么对齐？'];
  function submit() { if (!question.trim()) return; onAsk(question); setQuestion(''); }
  return <div className="page-view"><section className="page-intro qa-intro"><span className="eyebrow">学习答疑 · 可收藏与导出</span><h2>带着当前课程上下文提问</h2><p>工作台会先用已经校对的课程知识回答；需要更深推导时，可将当前问答一键带到 ChatGPT 继续。</p></section><section className="qa-composer"><textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="例如：ACT 为什么需要 CVAE？" onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit(); }} /><div><span>提示：尽量写出你已经理解的部分和卡住的地方。</span><button disabled={!question.trim()} onClick={submit}>提问 →</button></div></section><div className="qa-suggestions">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}</button>)}</div><div className="archive-actions"><span>答疑已单独归档，不混入学习进度。</span><a href="/api/export?type=qa">导出答疑 Markdown ↓</a></div>{qa.length === 0 ? <section className="empty-state compact-empty"><span>?</span><h3>还没有答疑记录</h3><p>选一个建议问题，或者从你当下卡住的概念开始。</p></section> : <div className="qa-history">{qa.map((item) => { const fav: Favorite = { itemId: `qa-${item.id}`, itemType: '学习答疑', title: item.question, summary: item.answer }; const saved = favorites.some((entry) => entry.itemId === fav.itemId); const chatPrompt = `我正在学习具身智能、VLA 与世界模型。\n\n我的问题：${item.question}\n\n学习工作台的初步回答：${item.answer}\n\n请检查这个回答的准确性，用小白可理解的方式继续深挖，并给出一个代码或实验例子。`; return <article key={item.id}><div className="qa-question"><span>Q</span><h3>{item.question}</h3></div><div className="qa-answer"><span>A</span><p>{item.answer}</p></div><div className="qa-actions"><small>{new Date(item.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</small><button className={saved ? 'saved' : ''} onClick={() => onFavorite(fav)}>{saved ? '已收藏' : '收藏问答'}</button><a href={`https://chatgpt.com/?q=${encodeURIComponent(chatPrompt)}`} target="_blank" rel="noreferrer">在 ChatGPT 中继续 ↗</a></div></article>; })}</div>}</div>;
}

function NotesView({ notes, onNotes }: { notes: NoteItem[]; onNotes: (notes: NoteItem[]) => void }) {
  const [query, setQuery] = useState('');
  const filtered = notes.filter((note) => `${note.title} ${note.content} ${note.context}`.toLowerCase().includes(query.toLowerCase()));
  async function remove(id: string) {
    if (!window.confirm('确认删除这条笔记？')) return;
    onNotes(notes.filter((note) => note.id !== id));
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'delete-note', id }) });
  }
  return <div className="page-view"><section className="page-intro"><span className="eyebrow">随手记 · 跨课程汇总</span><h2>所有灵感、疑问和代码线索集中在这里</h2><p>右下角的随手记在任何页面都可打开，会自动带上当前课程或功能上下文。</p></section><div className="notes-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索笔记内容或课程上下文…" /><a href="/api/export?type=notes">导出笔记 Markdown ↓</a></div>{filtered.length === 0 ? <section className="empty-state"><span>✎</span><h3>{notes.length ? '没有匹配的笔记' : '还没有学习笔记'}</h3><p>点击右下角「随手记」开始记录。</p></section> : <div className="notes-grid">{filtered.map((note) => <article key={note.id}><div><span>{note.context}</span><button onClick={() => remove(note.id)} aria-label="删除笔记">×</button></div><h3>{note.title}</h3><p>{note.content}</p><small>{new Date(note.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</small></article>)}</div>}</div>;
}

function InterviewsView({ filter, setFilter, items, onQuestion }: { filter: string; setFilter: (value: string) => void; items: InterviewItem[]; onQuestion: () => void }) { const cats = ['全部','VLA 架构','数据','后训练','工程','多模态感知','世界模型']; return <div className="page-view"><section className="page-intro"><span className="eyebrow">已去重归类 · 2026 年 4 月以来</span><h2>面试情报不是题库，是企业的「能力传感器」</h2><p>面经已单独存放为全局汇总，工作台只展示去重后的高信号问题。单一叙述不会直接改动学习计划。</p></section><div className="archive-actions"><span>面经归档：content/interviews/</span><a href="/api/export?type=interviews">导出面经汇总 Markdown ↓</a></div><div className="filters">{cats.map((cat) => <button className={filter === cat ? 'active' : ''} key={cat} onClick={() => setFilter(cat)}>{cat}</button>)}</div><section className="interview-layout"><div className="interview-list">{items.map((item, index) => <article key={item.id}><span className="rank">{String(index + 1).padStart(2, '0')}</span><div><p><b>{item.cat}</b><small>{item.source}</small></p><h3>{item.q}</h3><span className="frequency">近期提及 <strong>{item.freq}</strong> 次 · {item.level}</span></div><button onClick={item.id === 'q1' ? onQuestion : undefined}>{item.id === 'q1' ? '练习 →' : '已归档'}</button></article>)}</div><aside className="skill-radar"><span className="eyebrow">企业能力信号</span><h3>近 4 个月高频项</h3>{[['真机排障',92],['数据质检 / 对齐',88],['Flow Matching / Diffusion',81],['World Model / 双系统',79],['PyTorch 工程',78]].map((item) => <div className="skill-bar" key={item[0]}><span>{item[0]}<b>{item[1]}</b></span><i><em style={{ width: `${item[1]}%` }} /></i></div>)}<p>已将「真机排障」「数据时序对齐」和「世界模型 + 记忆」加入主线。</p></aside></section></div>; }

function JobsView({ favorites, onFavorite, onLocalSource }: { favorites: Favorite[]; onFavorite: (item: Favorite) => void; onLocalSource: () => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">杭州优先 · 上海补充 · 7.PNG 已纳入</span><h2>岗位不只看「能不能投」，还要看「缺口如何补」</h2><p>匹配分结合你的传感器、视觉、数据处理与 POC 经历，不代表录用概率。本地 JD 作为课程优先级证据保留。</p></section><div className="job-grid">{jobs.map((job) => { const saved = favorites.some((item) => item.itemId === job.id); return <article className="job-card" key={job.id}><div className="job-head"><span className="company-mark">{job.company[0]}</span><div><small>{job.company} · {job.city}</small><h3>{job.role}</h3></div><div className="fit"><b>{job.fit}</b><small>匹配度</small></div></div><div className="tags">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p>{job.reason}</p><div className="job-actions"><span>{job.date}</span><button className={saved ? 'saved' : ''} onClick={() => onFavorite({ itemId: job.id, itemType: '岗位', title: `${job.company} · ${job.role}`, summary: job.reason })}>{saved ? '已收藏' : '收藏'}</button>{job.localSource ? <button onClick={onLocalSource}>查看本地依据 ↗</button> : <a href={job.url} target="_blank" rel="noreferrer">查看来源 ↗</a>}</div></article>; })}</div><section className="gap-panel"><span className="eyebrow">你的下一个关键缺口</span><h3>把「读懂模型」升级为「能快速复现、微调、部署并做出闭环 Demo」</h3><p>7.png 对双系统、记忆、VLA / World Model 和快速原型同时提出要求，因此 9—12 月的学习会始终绑定代码、实验、真机与表达四个产出。</p></section></div>; }

function MistakesView({ answers, currentQuestionId, favorites, onFavorite, onRetry }: { answers: SavedAnswer[]; currentQuestionId: string; favorites: Favorite[]; onFavorite: (item: Favorite) => void; onRetry: () => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">正式期 · 自检与思考题统一收录</span><h2>每道错题都保留回答、反馈与讲解</h2><p>低于 80 分的课程自检和每日思考题会出现在这里，也可将题目与参考讲解收藏。</p></section>{answers.length === 0 ? <section className="empty-state"><span>✓</span><h3>目前没有正式错题</h3><p>当作答低于 80 分时，会自动收录在这里。</p></section> : <div className="mistake-list">{answers.map((answer) => { const favorite: Favorite = { itemId: `answer-${answer.id}`, itemType: '错题讲解', title: answer.questionTitle, summary: `${answer.feedback} 参考：${answer.reference}` }; const saved = favorites.some((item) => item.itemId === favorite.itemId); const lessonTarget = answer.questionId.startsWith('quiz-') ? answer.questionId.slice(5) : answer.questionId.replace('lesson-', ''); return <article key={answer.id}><div className="score-ring">{answer.score}<small>/100</small></div><div><span className="eyebrow">{answer.itemType}</span><h3>{answer.questionTitle}</h3><p>{answer.feedback}</p><details><summary>查看作答与讲解</summary><b>你的回答</b><p>{answer.answer}</p><b>参考讲解</b><p>{answer.reference}</p></details></div><div className="mistake-actions"><button className={saved ? 'saved' : ''} onClick={() => onFavorite(favorite)}>{saved ? '已收藏' : '收藏讲解'}</button>{answer.questionId === currentQuestionId ? <button onClick={onRetry}>重新作答 →</button> : answer.questionId.startsWith('daily-') ? null : <a href={`/learn/${lessonTarget}#self-check`}>返回课程 →</a>}</div></article>; })}</div>}</div>; }

function FavoritesView({ favorites, onRemove }: { favorites: Favorite[]; onRemove: (item: Favorite) => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">统一收藏夹</span><h2>把值得重读的模型、岗位与答疑放在一起</h2><p>问答会同时保留在独立答疑归档中；每周日从这里选一项转成代码笔记或面试回答。</p></section>{favorites.length === 0 ? <section className="empty-state"><span>♡</span><h3>收藏夹还是空的</h3><p>在模型洞察、岗位或答疑页点击收藏。</p></section> : <div className="favorite-grid">{favorites.map((item) => <article key={item.itemId}><span>{item.itemType}</span><h3>{item.title}</h3><p>{item.summary}</p><button onClick={() => onRemove(item)}>移出收藏</button></article>)}</div>}</div>; }

function QuestionModal({ question, draft, setDraft, result, onSubmit, onClose, isFuture }: { question: DailyQuestion; draft: string; setDraft: (value: string) => void; result: { score: number; feedback: string; reference: string } | null; onSubmit: () => void; onClose: () => void; isFuture: boolean }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal question-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">每日思考题 · 与当天三门课程关联</span><h2>{question.title}</h2>{!result ? <><p className="answer-hint">{question.summary}</p><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="先用自己的话回答…" rows={8} disabled={isFuture} /><div className="modal-actions"><span>{draft.length} 字</span><button className="primary" disabled={isFuture || draft.trim().length < 12} onClick={onSubmit}>{isFuture ? '尚未开放' : '提交并评分 →'}</button></div></> : <div className="answer-result"><div className={`result-score ${result.score < 80 ? 'low' : ''}`}><b>{result.score}</b><span>/ 100</span></div><div><h3>{result.score >= 80 ? '回答通过' : '已加入错题集'}</h3><p>{result.feedback}</p></div><section><b>讲解与参考答案</b><p>{result.reference}</p></section><button className="primary full" onClick={onClose}>完成本次练习</button></div>}</article></div>; }

function SearchModal({ query, setQuery, results, onClose }: { query: string; setQuery: (value: string) => void; results: SearchItem[]; onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal search-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">全局搜索</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入 ACT、Spirit、世界模型、真机…" /><div className="search-results">{results.length ? results.map((item) => <button key={item.id} onClick={item.action}><span>{item.kind}</span><div><b>{item.title}</b><small>{item.detail}</small></div><em>→</em></button>) : <p>没有匹配结果，试试更短的关键词。</p>}</div></article></div>; }

function EvidenceModal({ onClose }: { onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal evidence-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">情报依据 · 可审计</span><h2>为什么调整学习主线</h2><p className="lead">课程只会在本地 JD、多份公开岗位或去重面经出现一致信号时调整，避免追逐单篇热点。</p><div className="evidence-list">{dailyEvidence.map((item, index) => <section key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{item.title}</b><small>{item.type}</small><p>{item.detail}</p></div></section>)}</div><div className="automation-status"><b>每日采集与审核流程</b><p>{generatedIntel.summary}</p><small>最后状态：{generatedIntel.updatedAt} · 原始记录归档到 content/daily-intel/</small></div><div className="modal-actions"><button className="primary" onClick={onClose}>我知道了</button></div></article></div>; }
