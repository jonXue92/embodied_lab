'use client';

import { useEffect, useMemo, useState } from 'react';
import generatedIntel from './generated-intel.json';
import { answerQuestion, dailyEvidence, interviewItems, jobs, lessons, models, phases, tasks, weekDays, type InterviewItem, type Lesson } from './content';

type View = 'today' | 'plan' | 'insights' | 'qa' | 'interviews' | 'jobs' | 'mistakes' | 'favorites';
type Favorite = { itemId: string; itemType: string; title: string; summary: string };
type SavedAnswer = { questionId: string; answer: string; score: number; feedback: string; createdAt: string };
type QaItem = { id: string; question: string; answer: string; createdAt: string };
type SearchItem = { id: string; kind: string; title: string; detail: string; action: () => void };

const FORMAL_START = new Date('2026-08-31T16:00:00.000Z');
const nav: { id: View; icon: string; label: string }[] = [
  { id: 'today', icon: '◫', label: '今日学习' }, { id: 'plan', icon: '◷', label: '学习计划' },
  { id: 'insights', icon: '◇', label: '模型洞察' }, { id: 'qa', icon: '≟', label: '学习答疑' },
  { id: 'interviews', icon: '▤', label: '面试情报' }, { id: 'jobs', icon: '◎', label: '岗位追踪' },
  { id: 'mistakes', icon: '⌑', label: '错题集' }, { id: 'favorites', icon: '♡', label: '我的收藏' },
];

function chinaDate() {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
}

export default function Studio() {
  const [view, setView] = useState<View>('today');
  const [done, setDone] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [qa, setQa] = useState<QaItem[]>([]);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<{ score: number; feedback: string; reference: string; trial?: boolean } | null>(null);
  const [filter, setFilter] = useState('全部');
  const [modelFilter, setModelFilter] = useState('全部');
  const [syncing, setSyncing] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const isTrial = new Date() < FORMAL_START;

  useEffect(() => {
    fetch('/api/state').then((response) => response.json()).then((data) => {
      setDone((data.progress ?? []).filter((item: { completed: number }) => item.completed).map((item: { itemId: string }) => item.itemId));
      setFavorites(data.favorites ?? []);
      setAnswers(data.answers ?? []);
      setQa(data.qa ?? []);
    }).catch(() => undefined).finally(() => setSyncing(false));
  }, []);

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

  function changeView(next: View) { setView(next); window.scrollTo(0, 0); }

  async function toggleTask(itemId: string) {
    const completed = !done.includes(itemId);
    setDone(completed ? [...done, itemId] : done.filter((id) => id !== itemId));
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'toggle-task', itemId, completed }) });
  }

  async function toggleFavorite(item: Favorite) {
    const saved = !favorites.some((favorite) => favorite.itemId === item.itemId);
    setFavorites(saved ? [item, ...favorites] : favorites.filter((favorite) => favorite.itemId !== item.itemId));
    await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'toggle-favorite', ...item, saved }) });
  }

  async function submitAnswer() {
    if (draft.trim().length < 12) return;
    const response = await fetch('/api/state', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'answer', questionId: 'action_chunk', answer: draft }) });
    const data = await response.json(); setResult(data);
    if (!data.trial) setAnswers([{ questionId: 'action_chunk', answer: draft, score: data.score, feedback: data.feedback, createdAt: new Date().toISOString() }, ...answers.filter((item) => item.questionId !== 'action_chunk')]);
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
    ...tasks.map((task) => ({ id: `lesson-${task.id}`, kind: '课程', title: task.title, detail: task.type, action: () => { setLessonId(task.id); setSearchOpen(false); } })),
    ...models.map((model) => ({ id: `model-${model.id}`, kind: model.family, title: model.name, detail: `${model.team} · ${model.highlight}`, action: () => { changeView('insights'); setModelFilter(model.family); setSearchOpen(false); } })),
    ...interviewItems.map((item) => ({ id: `question-${item.id}`, kind: '面试题', title: item.q, detail: `${item.cat} · ${item.source}`, action: () => { changeView('interviews'); setFilter(item.cat); setSearchOpen(false); } })),
    ...jobs.map((job) => ({ id: `job-${job.id}`, kind: '岗位', title: `${job.company} · ${job.role}`, detail: `${job.city} · ${job.skills.join(' / ')}`, action: () => { changeView('jobs'); setSearchOpen(false); } })),
  ], []);
  const searchResults = searchItems.filter((item) => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 12);
  const activeTitle = nav.find((item) => item.id === view)?.label;

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand brand-button" onClick={() => changeView('today')} aria-label="知行工坊首页"><span className="brand-mark">知</span><span><strong>知行工坊</strong><small>Embodied Lab</small></span></button>
      <nav className="nav-list" aria-label="主导航">{nav.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => changeView(item.id)}><span>{item.icon}</span>{item.label}{item.id === 'mistakes' && lowAnswers.length > 0 ? <b>{lowAnswers.length}</b> : null}</button>)}</nav>
      <div className="side-goal"><span className="eyebrow">年度目标</span><strong>从感知工程师到<br />具身算法工程师</strong><div className="goal-meter"><span /></div><small>2026 · 9 月 1 日正式开始</small></div>
      <div className="profile"><span className="avatar">XZ</span><span><strong>学习者</strong><small>杭州 · 模型 / 数据</small></span><span className={`sync-dot ${syncing ? 'loading' : ''}`} title={syncing ? '同步中' : '已同步'} /></div>
    </aside>

    <main className="main" id="top">
      {isTrial ? <div className="trial-banner"><b>试用迭代期</b><span>9 月 1 日正式开学。当前打卡、练习和错题仅用于测试，不计入学习数据；收藏与答疑归档会正常保存。</span></div> : null}
      <header className="topbar"><div><p className="date">{chinaDate()} · {isTrial ? '课程试运行' : '正式学习中'}</p><h1>{view === 'today' ? '早上好，今天先把概念分清' : activeTitle} <span>↗</span></h1></div><div className="header-actions"><button className="search" aria-label="搜索" onClick={() => setSearchOpen(true)}>⌕ <span>搜索课程、模型、岗位或题目</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="查看今日情报" onClick={() => setEvidenceOpen(true)}>◌<i /></button></div></header>

      {view === 'today' && <TodayView done={done} onTask={setLessonId} onToggle={toggleTask} onQuestion={() => { setQuestionOpen(true); setResult(null); }} onEvidence={() => setEvidenceOpen(true)} isTrial={isTrial} />}
      {view === 'plan' && <PlanView />}
      {view === 'insights' && <InsightsView favorites={favorites} onFavorite={toggleFavorite} filter={modelFilter} setFilter={setModelFilter} items={filteredModels} />}
      {view === 'qa' && <QaView qa={qa} onAsk={askQuestion} favorites={favorites} onFavorite={toggleFavorite} />}
      {view === 'interviews' && <InterviewsView filter={filter} setFilter={setFilter} items={filteredQuestions} onQuestion={() => { setQuestionOpen(true); setResult(null); }} />}
      {view === 'jobs' && <JobsView favorites={favorites} onFavorite={toggleFavorite} onLocalSource={() => setEvidenceOpen(true)} />}
      {view === 'mistakes' && <MistakesView answers={lowAnswers} onRetry={() => { setQuestionOpen(true); setResult(null); }} />}
      {view === 'favorites' && <FavoritesView favorites={favorites} onRemove={toggleFavorite} />}
    </main>

    {lessonId ? <LessonModal lesson={lessons[lessonId]} isTrial={isTrial} onClose={() => setLessonId(null)} onDone={() => { toggleTask(lessonId); setLessonId(null); }} /> : null}
    {questionOpen ? <QuestionModal draft={draft} setDraft={setDraft} result={result} isTrial={isTrial} onSubmit={submitAnswer} onClose={() => setQuestionOpen(false)} /> : null}
    {searchOpen ? <SearchModal query={searchQuery} setQuery={setSearchQuery} results={searchResults} onClose={() => setSearchOpen(false)} /> : null}
    {evidenceOpen ? <EvidenceModal onClose={() => setEvidenceOpen(false)} /> : null}
  </div>;
}

function TodayView({ done, onTask, onToggle, onQuestion, onEvidence, isTrial }: { done: string[]; onTask: (id: string) => void; onToggle: (id: string) => void; onQuestion: () => void; onEvidence: () => void; isTrial: boolean }) {
  return <><section className="hero"><div className="hero-copy"><p className="kicker">{isTrial ? '试运行课程' : '今日主题 · DAY 01'}</p><h2>先分清 BC、ACT<br />再进入 <em>VLA 与世界模型</em></h2><p>从学习方式、策略架构和基础模型范式三个维度，建立一张不混淆的技术地图。</p><div className="hero-meta"><span><b>90</b> 分钟</span><span><b>3</b> 个任务</span><span><b>1</b> 道思考题</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-a"><span>V</span></div><div className="orbit orbit-b"><span>L</span></div><div className="orbit orbit-c"><span>A</span></div><div className="robot-core"><i className="eye left" /><i className="eye right" /><span>VLA</span></div><div className="grid-plane" /></div></section>
    <div className="content-grid"><section className="today-panel"><div className="section-heading"><div><span className="eyebrow">今日必修</span><h3>完成今天的 3 次学习</h3></div><span className="completion">{done.length} / 3 {isTrial ? '试用完成' : '完成'}</span></div><div className="task-list">{tasks.map((task, index) => { const checked = done.includes(task.id); return <article className={`task-card ${checked ? 'done' : ''}`} key={task.id} onClick={() => onTask(task.id)}><span className={`task-index ${task.color}`}>0{index + 1}</span><div className="task-copy"><p><span>{task.type}</span><small>{task.time}</small></p><h4>{task.title}</h4></div><button className="check-button" aria-label={checked ? '标记为未完成' : '标记完成'} onClick={(event) => { event.stopPropagation(); onToggle(task.id); }}>{checked ? '✓' : '→'}</button></article>; })}</div></section>
      <aside className="right-rail"><section className="streak-card"><div className="section-heading compact"><div><span className="eyebrow">正式学习</span><h3>9 月 1 日起计录</h3></div><b>{isTrial ? '0' : '1'} <small>天</small></b></div><div className="week-row">{['一','二','三','四','五','六','日'].map((day) => <span key={day}><i />{day}</span>)}</div><p>试用期可以随意点击、作答和重置，不会污染正式学习记录。</p></section><section className="question-card"><span className="eyebrow">今日思考题 · 来自高频面经</span><h3>为什么 VLA 通常输出一段 Action Chunk，而不是只预测下一个动作？</h3><div className="question-meta"><span>VLA 算法 · 已去重</span><span>中等</span></div><button onClick={onQuestion}>开始思考 <span>→</span></button></section></aside></div>
    <section className="daily-signal"><span className="signal-mark">AUTO</span><div><span className="eyebrow">今日情报 · {generatedIntel.status === 'seeded' ? '自动流程已初始化' : '已更新'}</span><h3>岗位技能信号：「快/慢双系统 + 记忆 + World Model」进入主线</h3><p>{generatedIntel.summary}</p></div><button onClick={onEvidence}>查看依据 →</button></section></>;
}

function PlanView() { return <div className="page-view"><section className="page-intro"><span className="eyebrow">2026.09.01 — 2026.12.31</span><h2>从基础到一个可被看见的 <em>World + Action 真机作品</em></h2><p>课程已根据 7.png JD 重排：先用 BC / ACT / VLA 建地基，再进入 π0.5、Spirit v1.5 与主流 VLA，随后连接 LingBot-World / VA、Cosmos 3、快慢双系统和记忆。</p></section><section className="roadmap">{phases.map((phase, index) => <article className="phase" key={phase.month}><span className="phase-number">{index + 1}</span><div className="phase-date">{phase.month}<small>{phase.tag}</small></div><div className="phase-copy"><h3>{phase.title}</h3><p>{phase.detail}</p><strong>{phase.output}</strong></div></article>)}</section><section className="week-plan"><div className="section-heading"><div><span className="eyebrow">第 1 周 · 共 8 小时 55 分</span><h3>先建立全景，再进入代码与真机</h3></div><span className="plan-principle">输入 35% · 代码 45% · 复盘 20%</span></div><div className="day-grid">{weekDays.map((day, index) => <article key={day[0]}><span>{day[0]}<b>{day[2]}</b></span><strong>{day[1]}</strong><small>{index < 5 ? '论文 / 代码 / 手写笔记' : '实操 / 输出 / 归档'}</small></article>)}</div></section></div>; }

function InsightsView({ favorites, onFavorite, filter, setFilter, items }: { favorites: Favorite[]; onFavorite: (item: Favorite) => void; filter: string; setFilter: (value: string) => void; items: typeof models }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">VLA · WORLD MODEL · WORLD + ACTION</span><h2>不追型号，追问模型在预测什么</h2><p>用「输入—表示—未来世界—动作—执行」五层比较 SmolVLA、π0.5、Spirit v1.5、LingBot 和 Cosmos 3。</p></section><div className="filters model-filters">{['全部','VLA','World Model','World + Action'].map((family) => <button key={family} className={filter === family ? 'active' : ''} onClick={() => setFilter(family)}>{family}</button>)}</div><section className="insight-summary"><span>01</span><div><b>新的主线</b><h3>Policy 解决「现在做什么」，World Model 解决「做了会发生什么」，World Action Model 开始让两者共享表示与训练数据。</h3></div></section><div className="model-grid">{items.map((model) => { const saved = favorites.some((item) => item.itemId === model.id); return <article className="model-card" key={model.id}><div className="model-top"><span>{model.name.slice(0, 2)}</span><div><small>{model.team} · {model.family}</small><h3>{model.name}</h3></div><button className={saved ? 'saved' : ''} onClick={() => onFavorite({ itemId: model.id, itemType: '模型洞察', title: model.name, summary: model.highlight })}>{saved ? '♥' : '♡'}</button></div><dl><div><dt>规模</dt><dd>{model.scale}</dd></div><div><dt>输出 / 动作</dt><dd>{model.action}</dd></div><div><dt>数据</dt><dd>{model.data}</dd></div></dl><h4>{model.highlight}</h4><p>{model.code}</p><a href={model.url} target="_blank" rel="noreferrer">查看官方工作 ↗</a></article>; })}</div><section className="code-lens"><span className="eyebrow">代码对比镜头 · POLICY VS WORLD + ACTION</span><div className="compare-code"><article><b>ACT / VLA Policy</b><code>context = encoder(obs, language)<br />actions = policy(context) # [B, K, A]</code><p>直接从观测预测动作，效率高，但不一定显式表示动作的未来后果。</p></article><article><b>World + Action</b><code>future = world_model(obs, candidate_action)<br />action = inverse_dynamics(obs, future)</code><p>先预演未来，再选择或反推动作，更适合规划、失败预测和慢思考。</p></article></div></section></div>; }

function QaView({ qa, onAsk, favorites, onFavorite }: { qa: QaItem[]; onAsk: (question: string) => void; favorites: Favorite[]; onFavorite: (item: Favorite) => void }) {
  const [question, setQuestion] = useState('');
  const suggestions = ['BC、ACT 和 VLA 到底是什么关系？', '世界模型与 VLA 怎么分工？', '图像、关节状态和动作时延怎么对齐？'];
  function submit() { if (!question.trim()) return; onAsk(question); setQuestion(''); }
  return <div className="page-view"><section className="page-intro qa-intro"><span className="eyebrow">学习答疑 · 可收藏与导出</span><h2>带着当前课程上下文提问</h2><p>工作台会先用已经校对的课程知识回答；需要更深推导时，可将当前问答一键带到 ChatGPT 继续。</p></section><section className="qa-composer"><textarea rows={4} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="例如：ACT 为什么需要 CVAE？" onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit(); }} /><div><span>提示：尽量写出你已经理解的部分和卡住的地方。</span><button disabled={!question.trim()} onClick={submit}>提问 →</button></div></section><div className="qa-suggestions">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}</button>)}</div><div className="archive-actions"><span>答疑已单独归档，不混入学习进度。</span><a href="/api/export?type=qa">导出答疑 Markdown ↓</a></div>{qa.length === 0 ? <section className="empty-state compact-empty"><span>?</span><h3>还没有答疑记录</h3><p>选一个建议问题，或者从你当下卡住的概念开始。</p></section> : <div className="qa-history">{qa.map((item) => { const fav: Favorite = { itemId: `qa-${item.id}`, itemType: '学习答疑', title: item.question, summary: item.answer }; const saved = favorites.some((entry) => entry.itemId === fav.itemId); const chatPrompt = `我正在学习具身智能、VLA 与世界模型。\n\n我的问题：${item.question}\n\n学习工作台的初步回答：${item.answer}\n\n请检查这个回答的准确性，用小白可理解的方式继续深挖，并给出一个代码或实验例子。`; return <article key={item.id}><div className="qa-question"><span>Q</span><h3>{item.question}</h3></div><div className="qa-answer"><span>A</span><p>{item.answer}</p></div><div className="qa-actions"><small>{new Date(item.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</small><button className={saved ? 'saved' : ''} onClick={() => onFavorite(fav)}>{saved ? '已收藏' : '收藏问答'}</button><a href={`https://chatgpt.com/?q=${encodeURIComponent(chatPrompt)}`} target="_blank" rel="noreferrer">在 ChatGPT 中继续 ↗</a></div></article>; })}</div>}</div>;
}

function InterviewsView({ filter, setFilter, items, onQuestion }: { filter: string; setFilter: (value: string) => void; items: InterviewItem[]; onQuestion: () => void }) { const cats = ['全部','VLA 架构','数据','后训练','工程','多模态感知','世界模型']; return <div className="page-view"><section className="page-intro"><span className="eyebrow">已去重归类 · 2026 年 4 月以来</span><h2>面试情报不是题库，是企业的「能力传感器」</h2><p>面经已单独存放为全局汇总，工作台只展示去重后的高信号问题。单一叙述不会直接改动学习计划。</p></section><div className="archive-actions"><span>面经归档：content/interviews/</span><a href="/api/export?type=interviews">导出面经汇总 Markdown ↓</a></div><div className="filters">{cats.map((cat) => <button className={filter === cat ? 'active' : ''} key={cat} onClick={() => setFilter(cat)}>{cat}</button>)}</div><section className="interview-layout"><div className="interview-list">{items.map((item, index) => <article key={item.id}><span className="rank">{String(index + 1).padStart(2, '0')}</span><div><p><b>{item.cat}</b><small>{item.source}</small></p><h3>{item.q}</h3><span className="frequency">近期提及 <strong>{item.freq}</strong> 次 · {item.level}</span></div><button onClick={item.id === 'q1' ? onQuestion : undefined}>{item.id === 'q1' ? '练习 →' : '已归档'}</button></article>)}</div><aside className="skill-radar"><span className="eyebrow">企业能力信号</span><h3>近 4 个月高频项</h3>{[['真机排障',92],['数据质检 / 对齐',88],['Flow Matching / Diffusion',81],['World Model / 双系统',79],['PyTorch 工程',78]].map((item) => <div className="skill-bar" key={item[0]}><span>{item[0]}<b>{item[1]}</b></span><i><em style={{ width: `${item[1]}%` }} /></i></div>)}<p>已将「真机排障」「数据时序对齐」和「世界模型 + 记忆」加入主线。</p></aside></section></div>; }

function JobsView({ favorites, onFavorite, onLocalSource }: { favorites: Favorite[]; onFavorite: (item: Favorite) => void; onLocalSource: () => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">杭州优先 · 上海补充 · 7.PNG 已纳入</span><h2>岗位不只看「能不能投」，还要看「缺口如何补」</h2><p>匹配分结合你的传感器、视觉、数据处理与 POC 经历，不代表录用概率。本地 JD 作为课程优先级证据保留。</p></section><div className="job-grid">{jobs.map((job) => { const saved = favorites.some((item) => item.itemId === job.id); return <article className="job-card" key={job.id}><div className="job-head"><span className="company-mark">{job.company[0]}</span><div><small>{job.company} · {job.city}</small><h3>{job.role}</h3></div><div className="fit"><b>{job.fit}</b><small>匹配度</small></div></div><div className="tags">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p>{job.reason}</p><div className="job-actions"><span>{job.date}</span><button className={saved ? 'saved' : ''} onClick={() => onFavorite({ itemId: job.id, itemType: '岗位', title: `${job.company} · ${job.role}`, summary: job.reason })}>{saved ? '已收藏' : '收藏'}</button>{job.localSource ? <button onClick={onLocalSource}>查看本地依据 ↗</button> : <a href={job.url} target="_blank" rel="noreferrer">查看来源 ↗</a>}</div></article>; })}</div><section className="gap-panel"><span className="eyebrow">你的下一个关键缺口</span><h3>把「读懂模型」升级为「能快速复现、微调、部署并做出闭环 Demo」</h3><p>7.png 对双系统、记忆、VLA / World Model 和快速原型同时提出要求，因此 9—12 月的学习会始终绑定代码、实验、真机与表达四个产出。</p></section></div>; }

function MistakesView({ answers, onRetry }: { answers: SavedAnswer[]; onRetry: () => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">仅正式期且低于 80 分才收录</span><h2>错题的价值在于二次表达</h2><p>9 月 1 日前的试答不入库；正式期第一次暴露理解缺口，第二次用结构化语言说清权衡。</p></section>{answers.length === 0 ? <section className="empty-state"><span>✓</span><h3>目前没有正式错题</h3><p>正式开学后，低于 80 分的回答会自动出现在这里。</p></section> : <div className="mistake-list">{answers.map((answer) => <article key={answer.questionId}><div className="score-ring">{answer.score}<small>/100</small></div><div><span className="eyebrow">ACTION CHUNK · 思考题</span><h3>为什么 VLA 通常输出一段 Action Chunk？</h3><p>{answer.feedback}</p><details><summary>查看上次回答</summary>{answer.answer}</details></div><button onClick={onRetry}>重新作答 →</button></article>)}</div>}</div>; }

function FavoritesView({ favorites, onRemove }: { favorites: Favorite[]; onRemove: (item: Favorite) => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">统一收藏夹</span><h2>把值得重读的模型、岗位与答疑放在一起</h2><p>问答会同时保留在独立答疑归档中；每周日从这里选一项转成代码笔记或面试回答。</p></section>{favorites.length === 0 ? <section className="empty-state"><span>♡</span><h3>收藏夹还是空的</h3><p>在模型洞察、岗位或答疑页点击收藏。</p></section> : <div className="favorite-grid">{favorites.map((item) => <article key={item.itemId}><span>{item.itemType}</span><h3>{item.title}</h3><p>{item.summary}</p><button onClick={() => onRemove(item)}>移出收藏</button></article>)}</div>}</div>; }

function LessonModal({ lesson, onClose, onDone, isTrial }: { lesson: Lesson; onClose: () => void; onDone: () => void; isTrial: boolean }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal lesson-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">课程深挖 · 概念到代码</span><h2>{lesson.title}</h2><p className="lead">{lesson.intro}</p><div className="lesson-sections">{lesson.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}</div><h3>必须带走的点</h3><ol>{lesson.points.map((point) => <li key={point}>{point}</li>)}</ol><div className="code-block"><span>concept.py</span><pre>{lesson.code}</pre></div><div className="lesson-sources"><b>官方延伸</b>{lesson.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div><div className="lesson-prompt"><b>学完自检</b><p>{lesson.prompt}</p></div><div className="modal-actions"><button onClick={onClose}>稍后继续</button><button className="primary" onClick={onDone}>{isTrial ? '试用完成（不入库）' : '已理解，完成打卡 ✓'}</button></div></article></div>; }

function QuestionModal({ draft, setDraft, result, onSubmit, onClose, isTrial }: { draft: string; setDraft: (value: string) => void; result: { score: number; feedback: string; reference: string; trial?: boolean } | null; onSubmit: () => void; onClose: () => void; isTrial: boolean }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal question-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">思考题 · 结构化表达{isTrial ? ' · 试用不入库' : ''}</span><h2>为什么 VLA 通常输出一段 Action Chunk，而不是只预测下一个动作？</h2>{!result ? <><p className="answer-hint">建议按「问题 → 机制 → 权衡 → 工程实现」四层回答。</p><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="先用自己的话回答…" rows={8} /><div className="modal-actions"><span>{draft.length} 字</span><button className="primary" disabled={draft.trim().length < 12} onClick={onSubmit}>{isTrial ? '试用评分 →' : '提交并评分 →'}</button></div></> : <div className="answer-result"><div className={`result-score ${result.score < 80 ? 'low' : ''}`}><b>{result.score}</b><span>/ 100</span></div><div><h3>{result.trial ? '试用评分完成，未入库' : result.score >= 80 ? '回答通过' : '已加入错题集'}</h3><p>{result.feedback}</p></div><section><b>参考答案</b><p>{result.reference}</p></section><button className="primary full" onClick={onClose}>完成本次练习</button></div>}</article></div>; }

function SearchModal({ query, setQuery, results, onClose }: { query: string; setQuery: (value: string) => void; results: SearchItem[]; onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal search-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">全局搜索</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入 ACT、Spirit、世界模型、真机…" /><div className="search-results">{results.length ? results.map((item) => <button key={item.id} onClick={item.action}><span>{item.kind}</span><div><b>{item.title}</b><small>{item.detail}</small></div><em>→</em></button>) : <p>没有匹配结果，试试更短的关键词。</p>}</div></article></div>; }

function EvidenceModal({ onClose }: { onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal evidence-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">情报依据 · 可审计</span><h2>为什么调整学习主线</h2><p className="lead">课程只会在本地 JD、多份公开岗位或去重面经出现一致信号时调整，避免追逐单篇热点。</p><div className="evidence-list">{dailyEvidence.map((item, index) => <section key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{item.title}</b><small>{item.type}</small><p>{item.detail}</p></div></section>)}</div><div className="automation-status"><b>每日采集与审核流程</b><p>{generatedIntel.summary}</p><small>最后状态：{generatedIntel.updatedAt} · 原始记录归档到 content/daily-intel/</small></div><div className="modal-actions"><button className="primary" onClick={onClose}>我知道了</button></div></article></div>; }
