import { env } from 'cloudflare:workers';
import { addDays, COURSE_START_DATE, COURSE_END_DATE, getDailyLearningPlan, getDynamicRubric, isCurriculumDate, resolveLearningDate, shanghaiDateKey } from '@/app/curriculum';

const rubrics: Record<string, { keywords: string[]; answer: string }> = {
  action_chunk: {
    keywords: ['时间', '连贯', '误差', '频率', '闭环', '抖动', 'chunk', '轨迹'],
    answer: 'Action Chunk 一次预测短时域轨迹，能建模动作间的时序相关性，减少单步推理延迟与逐步误差累积。执行时常用 temporal ensemble 或滚动重规划，在平滑性和闭环纠错之间取得平衡。',
  },
  'lesson-vla-map': {
    keywords: ['学习', '目标', '架构', '基础模型', '分布偏移', 'reward', 'value', '改进'],
    answer: 'BC 是用专家演示监督策略的学习目标；ACT 是一种一次预测 action chunk、可用 BC 训练的 policy 架构；VLA 是把视觉、语言和动作统一的基础模型范式。RL 使用 rollout 的 reward / value 反馈，弥补 BC 的分布偏移，让已部署 policy 继续改进。',
  },
  'lesson-act-code': {
    keywords: ['张量', '时间', '推理', '频率', '平滑', '闭环', '纠错', '过期'],
    answer: 'K 增大会增加张量时间维、内存与拟合难度；完整执行 chunk 时可减少推理调用并增强轨迹连贯性，但新观测出现后的闭环纠错变慢，后段动作更容易过期。需用滚动重规划、Temporal Ensemble 和真机对比实验选 K。',
  },
  'lesson-world-policy': {
    keywords: ['高频', '异步', '记忆', '人工', '介入', '安全', 'value', 'learner', '过期'],
    answer: '高频回路由 fast policy 根据新观测和短时记忆输出动作，每步经过安全约束和人工接管。World Model 异步预演并产生带时间戳的计划，过期计划必须废弃。所有 proposed/executed action、介入、reward 和结果进入 replay，learner 在非控制线程训练 value 与新 policy，通过安全评测后再部署。',
  },
};

async function ensureTables() {
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS progress (item_id TEXT PRIMARY KEY, completed INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS favorites (item_id TEXT PRIMARY KEY, item_type TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS answers (question_id TEXT PRIMARY KEY, answer TEXT NOT NULL, score INTEGER NOT NULL, feedback TEXT NOT NULL, created_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS qa_conversations (id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, created_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_qa_created_at ON qa_conversations(created_at)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS learning_answers (id TEXT PRIMARY KEY, question_id TEXT NOT NULL, question_title TEXT NOT NULL, item_type TEXT NOT NULL, answer TEXT NOT NULL, score INTEGER NOT NULL, feedback TEXT NOT NULL, reference TEXT NOT NULL, created_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_learning_answers_created_at ON learning_answers(created_at)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, context TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS daily_progress (id TEXT PRIMARY KEY, learning_date TEXT NOT NULL, item_id TEXT NOT NULL, task_type TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_progress_date_item ON daily_progress(learning_date, item_id)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_daily_progress_date_completed ON daily_progress(learning_date, completed)'),
    env.DB.prepare("INSERT OR IGNORE INTO daily_progress (id, learning_date, item_id, task_type, completed, updated_at) SELECT '2026-09-01-foundation', '2026-09-01', '2026-09-01-foundation', 'foundation', completed, updated_at FROM progress WHERE item_id = 'vla-map'"),
    env.DB.prepare("INSERT OR IGNORE INTO daily_progress (id, learning_date, item_id, task_type, completed, updated_at) SELECT '2026-09-01-code', '2026-09-01', '2026-09-01-code', 'code', completed, updated_at FROM progress WHERE item_id = 'act-code'"),
    env.DB.prepare("INSERT OR IGNORE INTO daily_progress (id, learning_date, item_id, task_type, completed, updated_at) SELECT '2026-09-01-insight', '2026-09-01', '2026-09-01-insight', 'insight', completed, updated_at FROM progress WHERE item_id = 'world-policy'"),
  ]);
}

function streakFromDates(completedDates: string[], today: string) {
  const dates = new Set(completedDates);
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cursor)) { streak += 1; cursor = addDays(cursor, -1); }
  return streak;
}

export async function GET(request: Request) {
  await ensureTables();
  const requestedDate = new URL(request.url).searchParams.get('date') ?? resolveLearningDate(shanghaiDateKey());
  if (!isCurriculumDate(requestedDate)) return Response.json({ error: '学习日期不在教学大纲范围内' }, { status: 400 });
  const today = shanghaiDateKey();
  const [progress, completedDateRows, favorites, answers, qa, notes] = await env.DB.batch([
    env.DB.prepare('SELECT item_id AS itemId, task_type AS taskType, completed, updated_at AS updatedAt FROM daily_progress WHERE learning_date = ? ORDER BY task_type').bind(requestedDate),
    env.DB.prepare(`SELECT learning_date AS learningDate FROM daily_progress
      WHERE completed = 1 AND learning_date BETWEEN ? AND ? AND learning_date <= ?
        AND task_type IN ('foundation', 'code', 'insight')
        AND item_id = learning_date || '-' || task_type
      GROUP BY learning_date HAVING COUNT(DISTINCT task_type) = 3 ORDER BY learning_date`).bind(COURSE_START_DATE, COURSE_END_DATE, today),
    env.DB.prepare('SELECT item_id AS itemId, item_type AS itemType, title, summary FROM favorites ORDER BY updated_at DESC'),
    env.DB.prepare('SELECT id, question_id AS questionId, question_title AS questionTitle, item_type AS itemType, answer, score, feedback, reference, created_at AS createdAt FROM learning_answers ORDER BY created_at DESC'),
    env.DB.prepare('SELECT id, question, answer, created_at AS createdAt FROM qa_conversations ORDER BY created_at DESC'),
    env.DB.prepare('SELECT id, title, content, context, created_at AS createdAt, updated_at AS updatedAt FROM notes ORDER BY updated_at DESC'),
  ]);
  const completedDates = completedDateRows.results.map((row) => String((row as { learningDate: string }).learningDate)).filter(isCurriculumDate);
  return Response.json({
    progress: progress.results,
    progressSummary: { completedDays: completedDates.length, currentStreak: streakFromDates(completedDates, today), fullDayCompleted: completedDates.includes(requestedDate), completedDates },
    favorites: favorites.results, answers: answers.results, qa: qa.results, notes: notes.results,
  });
}

export async function POST(request: Request) {
  await ensureTables();
  const body = await request.json() as Record<string, unknown>;
  const now = new Date().toISOString();
  const today = shanghaiDateKey();
  const learningDate = String(body.learningDate ?? resolveLearningDate(today));

  if (body.type === 'toggle-task') {
    const itemId = String(body.itemId ?? '');
    const taskType = String(body.taskType ?? '');
    const task = getDailyLearningPlan(learningDate)?.tasks.find((item) => item.id === itemId && item.track === taskType);
    if (learningDate > today || !task || typeof body.completed !== 'boolean') return Response.json({ error: '无效或尚未开放的每日课程' }, { status: 400 });
    await env.DB.prepare('INSERT INTO daily_progress (id, learning_date, item_id, task_type, completed, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET completed = excluded.completed, task_type = excluded.task_type, updated_at = excluded.updated_at')
      .bind(itemId, learningDate, itemId, taskType, body.completed ? 1 : 0, now).run();
    return Response.json({ ok: true });
  }

  if (body.type === 'toggle-favorite') {
    if (body.saved) {
      await env.DB.prepare('INSERT INTO favorites (item_id, item_type, title, summary, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(item_id) DO UPDATE SET item_type = excluded.item_type, title = excluded.title, summary = excluded.summary, updated_at = excluded.updated_at')
        .bind(String(body.itemId), String(body.itemType), String(body.title), String(body.summary), now).run();
    } else {
      await env.DB.prepare('DELETE FROM favorites WHERE item_id = ?').bind(String(body.itemId)).run();
    }
    return Response.json({ ok: true });
  }

  if (body.type === 'answer') {
    if (!isCurriculumDate(learningDate) || learningDate > today) return Response.json({ error: '该学习日尚未开放' }, { status: 400 });
    const questionId = String(body.questionId);
    const answer = String(body.answer ?? '').trim();
    const rubric = getDynamicRubric(questionId) ?? rubrics[questionId] ?? rubrics.action_chunk;
    const hits = rubric.keywords.filter((keyword) => answer.toLowerCase().includes(keyword.toLowerCase())).length;
    const score = Math.min(96, Math.max(25, 28 + hits * 9 + Math.min(14, Math.floor(answer.length / 18))));
    const feedback = score >= 80 ? '回答已覆盖主要机制和验证思路。下一步可补充一个具体日志字段或对照实验，让结论更可执行。' : '已记入错题集。建议对照参考讲解，从输入假设、机制、失败信号和验证实验四层重组答案。';
    await env.DB.prepare('INSERT INTO learning_answers (id, question_id, question_title, item_type, answer, score, feedback, reference, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), questionId, String(body.questionTitle ?? questionId), String(body.itemType ?? '学习答题'), answer, score, feedback, rubric.answer, now).run();
    return Response.json({ score, feedback, reference: rubric.answer });
  }

  if (body.type === 'save-qa') {
    const id = String(body.id ?? '');
    const question = String(body.question ?? '').trim();
    const answer = String(body.answer ?? '').trim();
    if (!id || !question || !answer) return Response.json({ error: '问答内容不完整' }, { status: 400 });
    await env.DB.prepare('INSERT INTO qa_conversations (id, question, answer, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET question = excluded.question, answer = excluded.answer, created_at = excluded.created_at')
      .bind(id, question, answer, String(body.createdAt ?? now)).run();
    return Response.json({ ok: true });
  }

  if (body.type === 'save-note') {
    const id = String(body.id ?? '');
    const content = String(body.content ?? '').trim();
    if (!id || !content) return Response.json({ error: '笔记内容不完整' }, { status: 400 });
    await env.DB.prepare('INSERT INTO notes (id, title, content, context, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, content = excluded.content, context = excluded.context, updated_at = excluded.updated_at')
      .bind(id, String(body.title ?? '未命名笔记'), content, String(body.context ?? '全局随手记'), String(body.createdAt ?? now), now).run();
    return Response.json({ ok: true });
  }

  if (body.type === 'delete-note') {
    await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(String(body.id)).run();
    return Response.json({ ok: true });
  }

  return Response.json({ error: '未知操作' }, { status: 400 });
}
