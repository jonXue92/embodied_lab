'use client';

import { useEffect, useMemo, useState } from 'react';

type View = 'today' | 'plan' | 'insights' | 'interviews' | 'jobs' | 'mistakes' | 'favorites';
type Favorite = { itemId: string; itemType: string; title: string; summary: string };
type SavedAnswer = { questionId: string; answer: string; score: number; feedback: string; createdAt: string };

const nav: { id: View; icon: string; label: string }[] = [
  { id: 'today', icon: '◫', label: '今日学习' }, { id: 'plan', icon: '◷', label: '学习计划' },
  { id: 'insights', icon: '◇', label: '模型洞察' }, { id: 'interviews', icon: '▤', label: '面试情报' },
  { id: 'jobs', icon: '◎', label: '岗位追踪' }, { id: 'mistakes', icon: '⌑', label: '错题集' },
  { id: 'favorites', icon: '♡', label: '我的收藏' },
];

const tasks = [
  { id: 'vla-map', type: '基础知识', title: '从模仿学习到 VLA：机器人如何学会动作', time: '25 分钟', color: 'mint' },
  { id: 'act-code', type: '代码精读', title: '读懂 ACT 的 Chunking 与时序动作预测', time: '30 分钟', color: 'amber' },
  { id: 'smolvla-insight', type: '每日洞察', title: 'SmolVLA 为什么可以在小算力上训练', time: '15 分钟', color: 'blue' },
];

const phases = [
  { month: '08—09 月', tag: '地基', title: '建立模型与工程共同语言', detail: 'Python / PyTorch 重温；Transformer、VLM、模仿学习；ACT 与 Diffusion Policy；读懂 LeRobot 数据管线。', output: '输出：3 篇代码阅读笔记 + ACT 伪代码' },
  { month: '10 月', tag: '主线', title: '进入 VLA 架构与数据配方', detail: '对比 OpenVLA、π0.5、SmolVLA、LingBot-VLA、GR00T；动作 tokenization、Flow Matching、多本体数据对齐。', output: '输出：模型横评 + 小数据训练实验' },
  { month: '11 月', tag: '实战', title: '打通 SO-101 数据到部署闭环', detail: '标定、遥操采集、数据质检、SmolVLA 微调、异步推理、失败归因与 DAgger。', output: '输出：可复现 Pick & Place Demo' },
  { month: '12 月', tag: '求职', title: '完成作品集与面试闭环', detail: '泛化实验、消融、演示视频、GitHub README；每周两次模拟面试；定向杭州 / 上海岗位。', output: '输出：公开仓库 + 项目复盘 + 求职清单' },
];

const weekDays = [
  ['周一', 'VLA 全景与任务定义', '75m'], ['周二', 'PyTorch Tensor 与自动求导', '65m'],
  ['周三', 'Transformer 从 Attention 到代码', '80m'], ['周四', '模仿学习：BC、分布偏移、DAgger', '70m'],
  ['周五', 'ACT 论文与 Action Chunk 实现', '90m'], ['周六', 'LeRobot + SO-101 环境检查', '90m'],
  ['周日', '复盘、闪卡与面试题', '45m'],
];

const models = [
  { id: 'smolvla', name: 'SmolVLA', team: 'Hugging Face', scale: '450M', action: 'Flow Matching', data: '开源社区数据', highlight: '小模型 + 异步推理，最适合 SO-101 入门', code: 'SmolVLM2 对多视角与语言编码；Action Expert 交错自注意力与交叉注意力。', url: 'https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx' },
  { id: 'lingbot', name: 'LingBot-VLA', team: '蚂蚁灵波', scale: '4B', action: '连续动作专家', data: '20,000h / 9 种双臂', highlight: '工程实用主义，重视训练吞吐与深度蒸馏', code: '同时释出无深度与深度蒸馏 checkpoint，可直接比较模态价值。', url: 'https://github.com/Robbyant/lingbot-vla' },
  { id: 'groot', name: 'GR00T N1.7', team: 'NVIDIA', scale: '大型', action: 'Diffusion / VLA', data: '32,000h 人类 + 8,000h 仿真', highlight: '数据工厂、仿真、后训练到 TensorRT 部署的全栈', code: 'Cosmos-Reason2-2B 作为 VLM backbone，强化长时序任务分解。', url: 'https://developer.nvidia.com/blog/develop-humanoid-robot-policies-end-to-end-with-nvidia-isaac-gr00t/' },
  { id: 'wall', name: 'WALL-OSS', team: '自变量', scale: '基础模型', action: '语言—动作关联', data: '大规模多模态预训练', highlight: '将具身空间理解提前注入 VLM', code: '重点观察具身感知 token 如何与 action head 对齐。', url: 'https://arxiv.org/abs/2509.11766' },
];

const interviewItems = [
  { id: 'q1', cat: 'VLA 架构', q: 'π0 系列为什么使用 Flow Matching 生成连续动作？', freq: 8, source: '2026.07 面经汇总', level: '高频' },
  { id: 'q2', cat: '数据', q: '遥操数据中，图像与关节状态如何对齐？时延如何测量？', freq: 7, source: '杭州某具身公司', level: '高频' },
  { id: 'q3', cat: '后训练', q: 'VLA 的 SFT 数据配比应如何设计？如何避免新任务灾难性遗忘？', freq: 6, source: '上海 · Post-training', level: '必会' },
  { id: 'q4', cat: '工程', q: '真机成功率突然下降，你会如何分层排查？', freq: 9, source: '2026.06—08 多篇面经', level: '最高频' },
  { id: 'q5', cat: '多模态感知', q: '深度、触觉或 RAW 模态如何接入现有 VLA？', freq: 4, source: '上海 · 多模态算法', level: '高匹配' },
];

const jobs = [
  { id: 'job-arcsoft', company: '虹软科技', role: '27 届具身大脑 / VLA 算法工程师', city: '杭州', fit: 88, date: '08-21 更新', skills: ['VLM / VLA', 'World Model', 'Diffusion Policy', 'PPO / SAC'], reason: '地点优先；要求覆盖模型、训练与机器人实战，可用 SO-101 项目补齐。', url: 'https://www.nowcoder.com/jobs/detail/454521?urlSource=sitemap' },
  { id: 'job-uniview', company: '宇泛智能', role: '具身智能算法（VLN / VLA）', city: '杭州', fit: 84, date: '06 月发布', skills: ['3D 感知', '强化学习', '扩散模型', '真机部署'], reason: '你的视觉、LiDAR 和数据处理背景是差异化优势。', url: 'https://www.liepin.com/job/1978011737.shtml' },
  { id: 'job-post', company: '杭州具身团队', role: 'Post-training 算法实习生', city: '杭州 · 西湖', fit: 91, date: '08 月更新', skills: ['SFT Pipeline', '多任务数据配比', 'PPO / GRPO / DPO'], reason: '与 9—12 月 POC 中的后训练数据经验高度相关。', url: 'https://www.ncss.cn/student/jobs/NYAuURS6bzCbBUPYP7nhvh/detail.html' },
  { id: 'job-neoteai', company: '新智具身', role: '多模态 / 强化学习算法', city: '上海', fit: 86, date: '08 月在招', skills: ['视触觉', 'LLM / VLM / VLA', 'PPO / TD3', '遥操数据工场'], reason: '视触觉与多模态感知方向最贴合你的传感器经验。', url: 'https://www.neoteai.com/join.html' },
];

const lessonCopy: Record<string, { title: string; intro: string; points: string[]; code: string; prompt: string }> = {
  'vla-map': { title: '从 BC 到 VLA：先看懂「输入—表示—动作」', intro: 'VLA 不是一个完全新的物种。它仍在学习观测到动作的条件分布，只是把观测扩展为图像、语言、本体状态与历史，并借助大规模预训练获得更好的泛化。', points: ['BC：直接模仿专家动作，但会遭遇分布偏移。', 'ACT：预测动作片段，显式建模短时域轨迹。', 'VLA：利用 VLM 的语义与视觉表示，再由 action head 生成控制序列。'], code: 'image_tokens = vision_encoder(images)\ncontext = vlm(image_tokens, language, state)\naction_chunk = action_expert(context, noisy_actions, t)\nloss = flow_matching_loss(action_chunk, target_actions)', prompt: '用一句话说明：VLM 与 VLA 的根本差别是什么？' },
  'act-code': { title: '代码镜头：Action Chunk 在张量中是什么形状？', intro: '单步动作常是 [B, A]，Action Chunk 则是 [B, K, A]。K 是未来步数，A 是动作维度。这个变化让模型能够学会「一段动作如何连贯」。', points: ['训练时用 padding mask 屏蔽 episode 末尾无效动作。', '推理时不必执行完整 chunk，可滚动重规划。', 'Temporal ensemble 对不同时刻预测的重叠动作加权平均。'], code: '# actions: [batch, chunk_size, action_dim]\npred = policy(observation, qpos)\nweights = exp(-k * age_of_prediction)\naction_now = weighted_mean(pred[:, :, 0], weights)', prompt: '如果 chunk_size 从 10 增加到 100，你预期模型和控制分别会发生什么？' },
  'smolvla-insight': { title: 'SmolVLA 的「小」不只是参数量', intro: 'SmolVLA 使用 450M 参数，但更关键的是系统设计：减少视觉 token、跳层推理、交错注意力以及异步推理。这比单纯把大模型剪小更值得学。', points: ['SmolVLM2 负责多视角与语言理解。', 'Action Expert 通过 Flow Matching 生成连续动作块。', '异步推理让机器人执行当前 chunk 时，并行计算下一个 chunk。'], code: 'while robot.running:\n    execute(current_chunk)          # control thread\n    next_chunk = policy(obs_queue)  # inference thread\n    current_chunk = merge(next_chunk, fresh_state)', prompt: '为什么异步推理可能更快，却也可能引入更大的状态过期风险？' },
};

export default function Studio() {
  const [view, setView] = useState<View>('today');
  const [done, setDone] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [lesson, setLesson] = useState<string | null>(null);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<{ score: number; feedback: string; reference: string } | null>(null);
  const [filter, setFilter] = useState('全部');
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    fetch('/api/state').then((r) => r.json()).then((data) => {
      setDone((data.progress ?? []).filter((item: { completed: number }) => item.completed).map((item: { itemId: string }) => item.itemId));
      setFavorites(data.favorites ?? []); setAnswers(data.answers ?? []);
    }).catch(() => undefined).finally(() => setSyncing(false));
  }, []);

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
    setAnswers([{ questionId: 'action_chunk', answer: draft, score: data.score, feedback: data.feedback, createdAt: new Date().toISOString() }, ...answers.filter((item) => item.questionId !== 'action_chunk')]);
  }

  const lowAnswers = answers.filter((answer) => answer.score < 80);
  const filteredQuestions = useMemo(() => filter === '全部' ? interviewItems : interviewItems.filter((item) => item.cat === filter), [filter]);
  const activeTitle = nav.find((item) => item.id === view)?.label;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand brand-button" onClick={() => setView('today')} aria-label="知行工坊首页"><span className="brand-mark">知</span><span><strong>知行工坊</strong><small>Embodied Lab</small></span></button>
        <nav className="nav-list" aria-label="主导航">{nav.map((item) => <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => { setView(item.id); window.scrollTo(0, 0); }}><span>{item.icon}</span>{item.label}{item.id === 'mistakes' && lowAnswers.length > 0 ? <b>{lowAnswers.length}</b> : null}</button>)}</nav>
        <div className="side-goal"><span className="eyebrow">年度目标</span><strong>从感知工程师到<br />具身算法工程师</strong><div className="goal-meter"><span /></div><small>2026 · 还有 130 天</small></div>
        <div className="profile"><span className="avatar">XZ</span><span><strong>学习者</strong><small>杭州 · 模型 / 数据</small></span><span className={`sync-dot ${syncing ? 'loading' : ''}`} title={syncing ? '同步中' : '已同步'} /></div>
      </aside>

      <main className="main" id="top">
        <header className="topbar"><div><p className="date">2026 年 8 月 24 日 · 转型计划第 1 天</p><h1>{view === 'today' ? '早上好，今天开始第一步' : activeTitle} <span>↗</span></h1></div><div className="header-actions"><button className="search" aria-label="搜索">⌕ <span>搜索论文、模型或题目</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="更新情报">◌<i /></button></div></header>

        {view === 'today' && <TodayView done={done} onTask={setLesson} onToggle={toggleTask} onQuestion={() => { setQuestionOpen(true); setResult(null); }} />}
        {view === 'plan' && <PlanView />}
        {view === 'insights' && <InsightsView favorites={favorites} onFavorite={toggleFavorite} />}
        {view === 'interviews' && <InterviewsView filter={filter} setFilter={setFilter} items={filteredQuestions} onQuestion={() => { setQuestionOpen(true); setResult(null); }} />}
        {view === 'jobs' && <JobsView favorites={favorites} onFavorite={toggleFavorite} />}
        {view === 'mistakes' && <MistakesView answers={lowAnswers} onRetry={() => { setQuestionOpen(true); setResult(null); }} />}
        {view === 'favorites' && <FavoritesView favorites={favorites} onRemove={toggleFavorite} />}
      </main>

      {lesson && <LessonModal lesson={lessonCopy[lesson]} onClose={() => setLesson(null)} onDone={() => { toggleTask(lesson); setLesson(null); }} />}
      {questionOpen && <QuestionModal draft={draft} setDraft={setDraft} result={result} onSubmit={submitAnswer} onClose={() => setQuestionOpen(false)} />}
    </div>
  );
}

function TodayView({ done, onTask, onToggle, onQuestion }: { done: string[]; onTask: (id: string) => void; onToggle: (id: string) => void; onQuestion: () => void }) {
  return <><section className="hero"><div className="hero-copy"><p className="kicker">今日主题 · DAY 01</p><h2>建立第一张<br /><em>VLA 认知地图</em></h2><p>从「看见」「听懂」到「行动」，理解视觉—语言—动作模型的核心问题与技术演化。</p><div className="hero-meta"><span><b>75</b> 分钟</span><span><b>3</b> 个任务</span><span><b>1</b> 道思考题</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-a"><span>V</span></div><div className="orbit orbit-b"><span>L</span></div><div className="orbit orbit-c"><span>A</span></div><div className="robot-core"><i className="eye left" /><i className="eye right" /><span>VLA</span></div><div className="grid-plane" /></div></section>
    <div className="content-grid"><section className="today-panel"><div className="section-heading"><div><span className="eyebrow">今日必修</span><h3>完成今天的 3 次学习</h3></div><span className="completion">{done.length} / 3 完成</span></div><div className="task-list">{tasks.map((task, index) => { const checked = done.includes(task.id); return <article className={`task-card ${checked ? 'done' : ''}`} key={task.id} onClick={() => onTask(task.id)}><span className={`task-index ${task.color}`}>0{index + 1}</span><div className="task-copy"><p><span>{task.type}</span><small>{task.time}</small></p><h4>{task.title}</h4></div><button className="check-button" aria-label={checked ? '标记为未完成' : '标记完成'} onClick={(event) => { event.stopPropagation(); onToggle(task.id); }}>{checked ? '✓' : '→'}</button></article>; })}</div></section>
      <aside className="right-rail"><section className="streak-card"><div className="section-heading compact"><div><span className="eyebrow">本周节奏</span><h3>连续学习</h3></div><b>1 <small>天</small></b></div><div className="week-row">{['一','二','三','四','五','六','日'].map((day, index) => <span key={day} className={index === 0 ? 'current' : ''}><i>{index === 0 ? '✓' : ''}</i>{day}</span>)}</div><p>从每天 1 小时开始，不追求速度，追求可持续的复利。</p></section><section className="question-card"><span className="eyebrow">今日思考题 · 来自高频面经</span><h3>为什么 VLA 通常输出一段 Action Chunk，而不是只预测下一个动作？</h3><div className="question-meta"><span>VLA 算法 · 已去重</span><span>中等</span></div><button onClick={onQuestion}>开始思考 <span>→</span></button></section></aside></div>
    <section className="daily-signal"><span className="signal-mark">NEW</span><div><span className="eyebrow">今日情报</span><h3>岗位技能信号：「后训练数据 Pipeline + 真机闭环」频率上升</h3><p>近期杭州岗位将 SFT 数据配比、PPO / GRPO / DPO 与真机排障放在同一能力链中，已加入 10 月学习计划。</p></div><button>查看依据 →</button></section></>;
}

function PlanView() { return <div className="page-view"><section className="page-intro"><span className="eyebrow">2026.08.24 — 2026.12.31</span><h2>从基础到一个可被看见的 <em>SO-101 作品</em></h2><p>每天 60—90 分钟，知识学习与真实输出绑定。主线是 VLA 模型 + 数据 + 工程闭环，多模态感知作为你的差异化专长。</p></section><section className="roadmap">{phases.map((phase, index) => <article className="phase" key={phase.month}><span className="phase-number">{index + 1}</span><div className="phase-date">{phase.month}<small>{phase.tag}</small></div><div className="phase-copy"><h3>{phase.title}</h3><p>{phase.detail}</p><strong>{phase.output}</strong></div></article>)}</section><section className="week-plan"><div className="section-heading"><div><span className="eyebrow">第 1 周 · 共 8 小时 35 分</span><h3>先建立全景，再进入细节</h3></div><span className="plan-principle">输入 40% · 代码 40% · 复盘 20%</span></div><div className="day-grid">{weekDays.map((day, i) => <article key={day[0]}><span>{day[0]}<b>{day[2]}</b></span><strong>{day[1]}</strong><small>{i < 5 ? '论文 / 代码 / 手写笔记' : '实操 / 输出'}</small></article>)}</div></section></div>; }

function InsightsView({ favorites, onFavorite }: { favorites: Favorite[]; onFavorite: (item: Favorite) => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">共性 · 差异 · 代码落点</span><h2>不追型号，追问模型在解决什么</h2><p>每个模型都拆成输入表示、动作生成、数据配方、训练策略与推理部署五层，最后回到代码对比。</p></section><section className="insight-summary"><span>01</span><div><b>今日共识</b><h3>2026 年的主要分水岭已不是「是否用 VLM」，而是数据如何跨本体对齐、动作如何连续生成、推理如何闭环。</h3></div></section><div className="model-grid">{models.map((model) => { const saved = favorites.some((item) => item.itemId === model.id); return <article className="model-card" key={model.id}><div className="model-top"><span>{model.name.slice(0,2)}</span><div><small>{model.team}</small><h3>{model.name}</h3></div><button className={saved ? 'saved' : ''} onClick={() => onFavorite({ itemId: model.id, itemType: '模型洞察', title: model.name, summary: model.highlight })}>{saved ? '♥' : '♡'}</button></div><dl><div><dt>规模</dt><dd>{model.scale}</dd></div><div><dt>动作</dt><dd>{model.action}</dd></div><div><dt>数据</dt><dd>{model.data}</dd></div></dl><h4>{model.highlight}</h4><p>{model.code}</p><a href={model.url} target="_blank" rel="noreferrer">查看原始工作 ↗</a></article>; })}</div><section className="code-lens"><span className="eyebrow">代码对比镜头 · ACTION HEAD</span><div className="compare-code"><article><b>ACT</b><code>actions = decoder(query_embed, image_features)<br />loss = L1(actions, target) + KL(latent)</code><p>直接回归一段轨迹，结构直观，适合小数据快速闭环。</p></article><article><b>Flow Matching VLA</b><code>velocity = expert(context, noisy_action, t)<br />action = ode_solver(velocity, noise)</code><p>学习从噪声到动作分布的速度场，更适合多模态连续动作。</p></article></div></section></div>; }

function InterviewsView({ filter, setFilter, items, onQuestion }: { filter: string; setFilter: (value: string) => void; items: typeof interviewItems; onQuestion: () => void }) { const cats = ['全部','VLA 架构','数据','后训练','工程','多模态感知']; return <div className="page-view"><section className="page-intro"><span className="eyebrow">已去重归类 · 2026 年 4 月以来</span><h2>面试情报不是题库，是企业的「能力传感器」</h2><p>把零散面经转成频次、能力类别和学习计划的反馈信号。来源需要交叉验证，不把单一叙述当成通用标准。</p></section><div className="filters">{cats.map((cat) => <button className={filter === cat ? 'active' : ''} key={cat} onClick={() => setFilter(cat)}>{cat}</button>)}</div><section className="interview-layout"><div className="interview-list">{items.map((item, index) => <article key={item.id}><span className="rank">0{index + 1}</span><div><p><b>{item.cat}</b><small>{item.source}</small></p><h3>{item.q}</h3><span className="frequency">近期提及 <strong>{item.freq}</strong> 次 · {item.level}</span></div><button onClick={item.id === 'q1' ? onQuestion : undefined}>练习 →</button></article>)}</div><aside className="skill-radar"><span className="eyebrow">企业能力信号</span><h3>近 4 个月高频项</h3>{[['真机排障',92],['数据质检 / 对齐',88],['Flow Matching / Diffusion',81],['PyTorch 工程',78],['ROS2 / 部署',73]].map((item) => <div className="skill-bar" key={item[0]}><span>{item[0]}<b>{item[1]}</b></span><i><em style={{ width: `${item[1]}%` }} /></i></div>)}<p>已将「真机排障」和「数据时序对齐」前移到 9 月。</p></aside></section></div>; }

function JobsView({ favorites, onFavorite }: { favorites: Favorite[]; onFavorite: (item: Favorite) => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">杭州优先 · 上海补充</span><h2>岗位不只看「能不能投」，还要看「缺口如何补」</h2><p>匹配分结合你的传感器、视觉、数据处理与 POC 经历，不代表录用概率。岗位过期时仍保留作为能力样本。</p></section><div className="job-grid">{jobs.map((job) => { const saved = favorites.some((item) => item.itemId === job.id); return <article className="job-card" key={job.id}><div className="job-head"><span className="company-mark">{job.company[0]}</span><div><small>{job.company} · {job.city}</small><h3>{job.role}</h3></div><div className="fit"><b>{job.fit}</b><small>匹配度</small></div></div><div className="tags">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p>{job.reason}</p><div className="job-actions"><span>{job.date}</span><button className={saved ? 'saved' : ''} onClick={() => onFavorite({ itemId: job.id, itemType: '岗位', title: `${job.company} · ${job.role}`, summary: job.reason })}>{saved ? '已收藏' : '收藏'}</button><a href={job.url} target="_blank" rel="noreferrer">查看来源 ↗</a></div></article>; })}</div><section className="gap-panel"><span className="eyebrow">你的下一个关键缺口</span><h3>PyTorch 训练代码独立阅读 + 从数据到真机的可复现项目</h3><p>你的感知和数据背景已能形成区别，不应把时间平均分给所有基础课。未来 8 周的最高权重应是「读代码—改代码—跑实验—说清权衡」。</p></section></div>; }

function MistakesView({ answers, onRetry }: { answers: SavedAnswer[]; onRetry: () => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">只收录低于 80 分的回答</span><h2>错题的价值在于二次表达</h2><p>第一次暴露理解缺口，第二次强迫你用结构化语言说清技术权衡。</p></section>{answers.length === 0 ? <section className="empty-state"><span>✓</span><h3>目前没有错题</h3><p>完成今日思考题后，低于 80 分的回答会自动出现在这里。</p></section> : <div className="mistake-list">{answers.map((answer) => <article key={answer.questionId}><div className="score-ring">{answer.score}<small>/100</small></div><div><span className="eyebrow">ACTION CHUNK · 今日思考题</span><h3>为什么 VLA 通常输出一段 Action Chunk？</h3><p>{answer.feedback}</p><details><summary>查看上次回答</summary>{answer.answer}</details></div><button onClick={onRetry}>重新作答 →</button></article>)}</div>}</div>; }

function FavoritesView({ favorites, onRemove }: { favorites: Favorite[]; onRemove: (item: Favorite) => void }) { return <div className="page-view"><section className="page-intro"><span className="eyebrow">统一收藏夹</span><h2>把值得重读的模型、岗位与题目放在一起</h2><p>收藏不是终点。每周日复盘时，从这里选一项转成代码笔记或面试回答。</p></section>{favorites.length === 0 ? <section className="empty-state"><span>♡</span><h3>收藏夹还是空的</h3><p>在模型洞察或岗位页点击收藏，内容会在这里持续保存。</p></section> : <div className="favorite-grid">{favorites.map((item) => <article key={item.itemId}><span>{item.itemType}</span><h3>{item.title}</h3><p>{item.summary}</p><button onClick={() => onRemove(item)}>移出收藏</button></article>)}</div>}</div>; }

function LessonModal({ lesson, onClose, onDone }: { lesson: { title: string; intro: string; points: string[]; code: string; prompt: string }; onClose: () => void; onDone: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal lesson-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">今日课程 · 小白可读版</span><h2>{lesson.title}</h2><p className="lead">{lesson.intro}</p><h3>三个必须带走的点</h3><ol>{lesson.points.map((point) => <li key={point}>{point}</li>)}</ol><div className="code-block"><span>concept.py</span><pre>{lesson.code}</pre></div><div className="lesson-prompt"><b>学完自检</b><p>{lesson.prompt}</p></div><div className="modal-actions"><button onClick={onClose}>稍后继续</button><button className="primary" onClick={onDone}>已理解，完成打卡 ✓</button></div></article></div>; }

function QuestionModal({ draft, setDraft, result, onSubmit, onClose }: { draft: string; setDraft: (value: string) => void; result: { score: number; feedback: string; reference: string } | null; onSubmit: () => void; onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true"><article className="modal question-modal"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><span className="eyebrow">今日思考题 · 结构化表达</span><h2>为什么 VLA 通常输出一段 Action Chunk，而不是只预测下一个动作？</h2>{!result ? <><p className="answer-hint">建议按「问题 → 机制 → 权衡 → 工程实现」四层回答。至少 80 字，不用追求术语。</p><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="先用自己的话回答…" rows={8} /><div className="modal-actions"><span>{draft.length} 字</span><button className="primary" disabled={draft.trim().length < 12} onClick={onSubmit}>提交并评分 →</button></div></> : <div className="answer-result"><div className={`result-score ${result.score < 80 ? 'low' : ''}`}><b>{result.score}</b><span>/ 100</span></div><div><h3>{result.score >= 80 ? '回答通过' : '已加入错题集'}</h3><p>{result.feedback}</p></div><section><b>参考答案</b><p>{result.reference}</p></section><button className="primary full" onClick={onClose}>完成今日练习</button></div>}</article></div>; }
