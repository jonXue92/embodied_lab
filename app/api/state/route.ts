import { env } from 'cloudflare:workers';

const rubrics: Record<string, { keywords: string[]; answer: string }> = {
  action_chunk: {
    keywords: ['时间', '连贯', '误差', '频率', '闭环', '抖动', 'chunk', '轨迹'],
    answer: 'Action Chunk 一次预测短时域轨迹，能建模动作间的时序相关性，减少单步推理延迟与逐步误差累积。执行时常用 temporal ensemble 或滚动重规划，在平滑性和闭环纠错之间取得平衡。',
  },
};

async function ensureTables() {
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS progress (item_id TEXT PRIMARY KEY, completed INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS favorites (item_id TEXT PRIMARY KEY, item_type TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS answers (question_id TEXT PRIMARY KEY, answer TEXT NOT NULL, score INTEGER NOT NULL, feedback TEXT NOT NULL, created_at TEXT NOT NULL)'),
  ]);
}

export async function GET() {
  await ensureTables();
  const [progress, favorites, answers] = await env.DB.batch([
    env.DB.prepare('SELECT item_id AS itemId, completed FROM progress ORDER BY updated_at DESC'),
    env.DB.prepare('SELECT item_id AS itemId, item_type AS itemType, title, summary FROM favorites ORDER BY updated_at DESC'),
    env.DB.prepare('SELECT question_id AS questionId, answer, score, feedback, created_at AS createdAt FROM answers ORDER BY created_at DESC'),
  ]);
  return Response.json({ progress: progress.results, favorites: favorites.results, answers: answers.results });
}

export async function POST(request: Request) {
  await ensureTables();
  const body = await request.json() as Record<string, unknown>;
  const now = new Date().toISOString();

  if (body.type === 'toggle-task') {
    await env.DB.prepare('INSERT INTO progress (item_id, completed, updated_at) VALUES (?, ?, ?) ON CONFLICT(item_id) DO UPDATE SET completed = excluded.completed, updated_at = excluded.updated_at')
      .bind(String(body.itemId), body.completed ? 1 : 0, now).run();
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
    const questionId = String(body.questionId);
    const answer = String(body.answer ?? '').trim();
    const rubric = rubrics[questionId] ?? rubrics.action_chunk;
    const hits = rubric.keywords.filter((keyword) => answer.toLowerCase().includes(keyword.toLowerCase())).length;
    const score = Math.min(96, Math.max(25, 28 + hits * 9 + Math.min(14, Math.floor(answer.length / 18))));
    const feedback = score >= 80 ? '回答已覆盖核心权衡，表达也较完整。下一步可加上 temporal ensemble 的执行细节和一个实验例子。' : '已记入错题集。建议从「时序相关、推理频率、误差累积、闭环纠错」四个角度重组答案。';
    await env.DB.prepare('INSERT INTO answers (question_id, answer, score, feedback, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(question_id) DO UPDATE SET answer = excluded.answer, score = excluded.score, feedback = excluded.feedback, created_at = excluded.created_at')
      .bind(questionId, answer, score, feedback, now).run();
    return Response.json({ score, feedback, reference: rubric.answer });
  }

  return Response.json({ error: '未知操作' }, { status: 400 });
}
